/**
 * Rebuild Similar (off-catalog only) and Other-by-author (prefer off-shelf)
 * without re-fetching author bios.
 */
import { writeFile } from 'node:fs/promises'
import { createWriteStream, existsSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const { shelves } = await import(path.join(root, 'src/catalog.js'))
const { worthExploring, offShelfByShelf } = await import(path.join(root, 'src/discoveries.js'))
const { enrichments } = await import(path.join(root, 'src/enrichments.js'))
const { covers } = await import(path.join(root, 'src/covers-data.js'))

const extraCoversDir = path.join(root, 'public/covers/extra')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function bookKey(shelfId, index) {
  return `${shelfId}-${index}`
}

function primaryAuthor(author) {
  if (!author) return ''
  return author
    .replace(/^edited by\s+/i, '')
    .replace(/^associated with\s+/i, '')
    .replace(/^tr\.?\s+/i, '')
    .split(/[;(,/]/)[0]
    .replace(/\s+et al\.?/i, '')
    .trim()
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const catalogIndex = []
const catalogTitles = new Set()
for (const shelf of shelves) {
  shelf.books.forEach((book, index) => {
    const id = bookKey(shelf.id, index)
    catalogIndex.push({
      id,
      shelfId: shelf.id,
      title: book.title,
      author: book.author,
      primary: primaryAuthor(book.author),
      cover: covers[id]?.cover || null,
    })
    catalogTitles.add(norm(book.title))
    if (book.spine) catalogTitles.add(norm(book.spine))
  })
}

function isOnShelf(title) {
  return catalogTitles.has(norm(title))
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'LibraryBookshelf/1.0 (educational)' },
  })
  if (!res.ok) return null
  return res.json()
}

async function download(url, dest) {
  if (existsSync(dest)) return true
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LibraryBookshelf/1.0 (educational)' },
    })
    if (!res.ok || !res.body) return false
    const ctype = res.headers.get('content-type') || ''
    if (!ctype.includes('image')) return false
    await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
    return true
  } catch {
    return false
  }
}

const coverCache = new Map()

async function fetchExtraCover(title, author, slugHint) {
  const key = `${norm(title)}|${norm(author)}`
  if (coverCache.has(key)) return coverCache.get(key)
  const slug =
    slugHint ||
    `title-${norm(title).replace(/\s+/g, '-').slice(0, 40)}-${norm(author).replace(/\s+/g, '-').slice(0, 20)}`
  const dest = path.join(extraCoversDir, `${slug}.jpg`)
  if (existsSync(dest)) {
    const rel = `covers/extra/${slug}.jpg`
    coverCache.set(key, rel)
    return rel
  }
  const q = new URLSearchParams({ title: title.slice(0, 100), limit: '3' })
  if (author) q.set('author', author.slice(0, 50))
  const data = await fetchJson(`https://openlibrary.org/search.json?${q}`)
  await sleep(70)
  const doc = data?.docs?.find((d) => d.cover_i)
  if (!doc?.cover_i) {
    coverCache.set(key, null)
    return null
  }
  const ok = await download(`https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`, dest)
  const rel = ok ? `covers/extra/${slug}.jpg` : null
  coverCache.set(key, rel)
  return rel
}

/** Off-catalog similar picks — never titles already on the shelves */
function similarCandidates(entry) {
  const pool = [...(offShelfByShelf[entry.shelfId] || [])]
  // Mix in worthExploring that aren't on shelves
  for (const w of worthExploring) {
    if (!pool.some((p) => norm(p.title) === norm(w.title))) {
      pool.push({ title: w.title, author: w.author, why: w.why })
    }
  }
  const filtered = pool.filter((p) => !isOnShelf(p.title) && norm(p.title) !== norm(entry.title))
  // Rotate start so each book gets a varied slice
  const start = hash(entry.id) % Math.max(filtered.length, 1)
  const rotated = [...filtered.slice(start), ...filtered.slice(0, start)]
  return rotated.slice(0, 8)
}

async function buildSimilar(entry) {
  const picks = similarCandidates(entry)
  const out = []
  for (let i = 0; i < picks.length; i++) {
    const p = picks[i]
    const cover = await fetchExtraCover(p.title, p.author)
    out.push({
      title: p.title,
      author: p.author,
      cover,
      bookId: null,
      source: 'explore',
      why: p.why || null,
    })
  }
  return out
}

async function buildOtherByAuthor(entry) {
  const authorName = entry.primary
  if (!authorName || authorName.length < 3 || /uncertain|various|anthology/i.test(authorName)) {
    return []
  }

  const exclude = new Set([norm(entry.title)])
  const out = []

  // Prefer Open Library works not already on the shelves
  const data = await fetchJson(
    `https://openlibrary.org/search.json?author=${encodeURIComponent(authorName)}&limit=20`,
  )
  await sleep(80)
  const docs = data?.docs || []
  let n = 0
  for (const doc of docs) {
    const t = doc.title
    if (!t || exclude.has(norm(t)) || isOnShelf(t)) continue
    // Skip near-duplicates of the opened title (e.g. translations / short forms)
    const opened = norm(entry.title)
    if (opened.includes(norm(t)) || norm(t).includes(opened.slice(0, 18))) continue
    exclude.add(norm(t))
    const slug = `auth-${entry.id}-${n}`
    let cover = null
    if (doc.cover_i) {
      const dest = path.join(extraCoversDir, `${slug}.jpg`)
      if (existsSync(dest)) {
        cover = `covers/extra/${slug}.jpg`
      } else {
        const ok = await download(
          `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
          dest,
        )
        if (ok) cover = `covers/extra/${slug}.jpg`
      }
      await sleep(40)
    }
    out.push({
      title: t,
      author: authorName,
      cover,
      bookId: null,
      source: 'openlibrary',
    })
    n++
    if (out.length >= 8) break
  }

  // If still thin, allow other on-shelf works by same author (never the opened title)
  if (out.length < 4) {
    const name = norm(authorName)
    for (const hit of catalogIndex) {
      if (hit.id === entry.id) continue
      if (exclude.has(norm(hit.title))) continue
      if (!norm(hit.primary).includes(name.slice(0, 12))) continue
      exclude.add(norm(hit.title))
      out.push({
        title: hit.title,
        author: hit.author,
        cover: hit.cover,
        bookId: hit.id,
        source: 'catalog',
      })
      if (out.length >= 8) break
    }
  }

  return out
}

let i = 0
for (const entry of catalogIndex) {
  i++
  process.stdout.write(`[${i}/${catalogIndex.length}] ${entry.id}\r`)
  if (!enrichments[entry.id]) {
    enrichments[entry.id] = {
      longDescription: '',
      author: { name: entry.primary, bio: '', photo: null },
      similar: [],
      otherByAuthor: [],
    }
  }
  enrichments[entry.id].similar = await buildSimilar(entry)
  enrichments[entry.id].otherByAuthor = await buildOtherByAuthor(entry)
}
console.log('\nWriting enrichments…')

const js = `/** Auto-generated by scripts/enrich-details.mjs / refresh-recommendations.mjs */
export const enrichments = ${JSON.stringify(enrichments, null, 2)};

export function enrichmentFor(shelfId, index) {
  return enrichments[\`\${shelfId}-\${index}\`] || null;
}
`

await writeFile(path.join(root, 'src/enrichments.js'), js)

// Sanity: similar must never be on catalog
let bad = 0
for (const [id, e] of Object.entries(enrichments)) {
  for (const s of e.similar || []) {
    if (s.bookId || isOnShelf(s.title)) {
      console.warn('BAD similar', id, s.title)
      bad++
    }
  }
}
console.log('Done. bad similar count:', bad)
console.log('Sample philosophy-5 similar:', enrichments['philosophy-5']?.similar?.map((s) => s.title))
console.log('Sample philosophy-5 other:', enrichments['philosophy-5']?.otherByAuthor?.map((s) => s.title))
