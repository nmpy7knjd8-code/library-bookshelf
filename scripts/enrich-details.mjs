/**
 * Build richer detail-panel data: long descriptions, author bios/photos,
 * similar titles, and other works by the author.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { createWriteStream, existsSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const { shelves } = await import(path.join(root, 'src/catalog.js'))
const { relatedClusters, worthExploring } = await import(path.join(root, 'src/discoveries.js'))
const { covers } = await import(path.join(root, 'src/covers-data.js'))

const authorsDir = path.join(root, 'public/authors')
const extraCoversDir = path.join(root, 'public/covers/extra')
await mkdir(authorsDir, { recursive: true })
await mkdir(extraCoversDir, { recursive: true })

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

const catalogIndex = []
for (const shelf of shelves) {
  shelf.books.forEach((book, index) => {
    catalogIndex.push({
      shelfId: shelf.id,
      index,
      id: bookKey(shelf.id, index),
      title: book.title,
      spine: book.spine,
      author: book.author,
      primary: primaryAuthor(book.author),
      description: book.description,
      category: shelf.category,
      cover: covers[bookKey(shelf.id, index)]?.cover || null,
    })
  })
}

const authorCache = new Map()

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

async function resolveAuthor(name) {
  if (!name || /uncertain|various|anthology/i.test(name)) {
    return { name, bio: null, photo: null, olKey: null }
  }
  if (authorCache.has(name)) return authorCache.get(name)

  let bio = null
  let photo = null
  let olKey = null

  const search = await fetchJson(
    `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(name)}`,
  )
  await sleep(80)
  const doc = search?.docs?.[0]
  if (doc?.key) {
    olKey = doc.key
    const author = await fetchJson(`https://openlibrary.org/authors/${doc.key}.json`)
    await sleep(80)
    if (author) {
      const raw = author.bio
      bio = typeof raw === 'string' ? raw : raw?.value || null
      if (Array.isArray(author.photos) && author.photos[0] > 0) {
        const pid = author.photos[0]
        const dest = path.join(authorsDir, `${doc.key}.jpg`)
        const ok = await download(`https://covers.openlibrary.org/a/id/${pid}-M.jpg`, dest)
        if (ok) photo = `authors/${doc.key}.jpg`
      }
      // Prefer Wikipedia summary via wikidata
      const qid = author.remote_ids?.wikidata
      if (qid) {
        const wiki = await fetchJson(
          `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`,
        )
        await sleep(60)
        const entity = wiki?.entities?.[qid]
        const enTitle = entity?.sitelinks?.enwiki?.title
        if (enTitle) {
          const summary = await fetchJson(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(enTitle)}`,
          )
          await sleep(60)
          if (summary?.extract && (!bio || bio.length < 80)) {
            bio = summary.extract
          }
          if (!photo && summary?.thumbnail?.source) {
            const dest = path.join(authorsDir, `${doc.key}-wiki.jpg`)
            const ok = await download(summary.thumbnail.source, dest)
            if (ok) photo = `authors/${doc.key}-wiki.jpg`
          }
        }
      }
    }
  }

  // Wikipedia fallback by name
  if (!bio || !photo) {
    const summary = await fetchJson(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
    )
    await sleep(60)
    if (summary?.extract && !summary.type?.includes('disambiguation')) {
      if (!bio || bio.length < 80) bio = summary.extract
      if (!photo && summary?.thumbnail?.source) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const dest = path.join(authorsDir, `${slug}.jpg`)
        const ok = await download(summary.thumbnail.source, dest)
        if (ok) photo = `authors/${slug}.jpg`
      }
    }
  }

  if (bio && bio.length > 900) bio = `${bio.slice(0, 880).replace(/\s+\S*$/, '')}…`

  const result = { name, bio, photo, olKey }
  authorCache.set(name, result)
  return result
}

async function olWorkDescription(title, author) {
  const q = new URLSearchParams({
    title: title.replace(/\s*\(.*?\)\s*/g, ' ').slice(0, 100),
    limit: '5',
  })
  if (author) q.set('author', author.slice(0, 60))
  const data = await fetchJson(`https://openlibrary.org/search.json?${q}`)
  await sleep(80)
  const doc = data?.docs?.find((d) => d.key) || data?.docs?.[0]
  if (!doc?.key) return null
  const work = await fetchJson(`https://openlibrary.org${doc.key}.json`)
  await sleep(80)
  const desc = work?.description
  const text = typeof desc === 'string' ? desc : desc?.value
  if (!text) return null
  return text.replace(/\s+/g, ' ').trim()
}

function expandDescription(book, olText) {
  const base = book.description || ''
  if (olText && olText.length > base.length + 40) {
    // Merge: keep our framing, append OL overview if distinct
    const combined = `${base}\n\n${olText}`
    return combined.length > 1600 ? `${combined.slice(0, 1580).replace(/\s+\S*$/, '')}…` : combined
  }
  // Local expansion from category cues
  const extra = ` This shelf copy sits among related works in ${book.category.toLowerCase()}, inviting comparison of style, argument, and historical moment. Readers often approach it both as a self-contained classic and as a node in a longer conversation—one that rewards slow reading, annotation, and return visits across years.`
  return `${base}${extra}`
}

/** Off-catalog only — never recommend titles already on the shelves */
function similarFor(entry) {
  // Prefer refresh-recommendations.mjs for production data.
  // Kept here so full re-enrich stays consistent.
  const out = []
  const seen = new Set([norm(entry.title)])
  for (const w of worthExploring) {
    if (seen.has(norm(w.title))) continue
    if (catalogIndex.some((c) => norm(c.title) === norm(w.title))) continue
    seen.add(norm(w.title))
    out.push({
      title: w.title,
      author: w.author,
      cover: null,
      bookId: null,
      source: 'explore',
      why: w.why,
    })
    if (out.length >= 8) break
  }
  return out
}

function otherByAuthor(entry) {
  // Catalog matches only as a thin fallback; OL fill happens in olOtherWorks.
  const name = norm(entry.primary)
  if (!name || name.length < 3) return []
  return catalogIndex
    .filter((c) => c.id !== entry.id && norm(c.primary).includes(name.slice(0, 12)))
    .slice(0, 2)
    .map((hit) => ({
      title: hit.title,
      author: hit.author,
      cover: hit.cover,
      bookId: hit.id,
      source: 'catalog',
    }))
}

async function fetchExtraCover(title, author, slug) {
  const dest = path.join(extraCoversDir, `${slug}.jpg`)
  if (existsSync(dest)) return `covers/extra/${slug}.jpg`
  const q = new URLSearchParams({
    title: title.slice(0, 100),
    limit: '3',
  })
  if (author) q.set('author', author.slice(0, 50))
  const data = await fetchJson(`https://openlibrary.org/search.json?${q}`)
  await sleep(80)
  const doc = data?.docs?.find((d) => d.cover_i)
  if (!doc?.cover_i) return null
  const ok = await download(`https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`, dest)
  return ok ? `covers/extra/${slug}.jpg` : null
}

async function olOtherWorks(authorName, excludeTitle, existing) {
  if (!authorName || existing.length >= 6) return existing
  const data = await fetchJson(
    `https://openlibrary.org/search.json?author=${encodeURIComponent(authorName)}&limit=12`,
  )
  await sleep(100)
  const docs = data?.docs || []
  const seen = new Set(existing.map((e) => norm(e.title)))
  seen.add(norm(excludeTitle))
  const out = [...existing]
  let n = 0
  for (const doc of docs) {
    const t = doc.title
    if (!t || seen.has(norm(t))) continue
    seen.add(norm(t))
    const slug = `ol-${(doc.key || t).replace(/\W+/g, '').slice(0, 24)}-${n}`
    let cover = null
    if (doc.cover_i) {
      cover = await fetchExtraCover(t, authorName, slug)
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
  return out
}

const enrichments = {}

for (const entry of catalogIndex) {
  console.log('enrich', entry.id, entry.title.slice(0, 40))
  const authorInfo = await resolveAuthor(entry.primary || entry.author)
  const olDesc = await olWorkDescription(entry.title, entry.primary)
  let similar = similarFor(entry)
  // Fill missing similar covers for explore items
  for (let i = 0; i < similar.length; i++) {
    if (!similar[i].cover && similar[i].source === 'explore') {
      const slug = `sim-${entry.id}-${i}`
      similar[i].cover = await fetchExtraCover(similar[i].title, similar[i].author, slug)
    }
  }
  let others = otherByAuthor(entry)
  if (others.length < 4 && entry.primary) {
    others = await olOtherWorks(entry.primary, entry.title, others)
  }

  enrichments[entry.id] = {
    longDescription: expandDescription(entry, olDesc),
    author: {
      name: authorInfo.name || entry.primary || entry.author,
      bio: authorInfo.bio || `Author or editor associated with “${entry.title}.”`,
      photo: authorInfo.photo,
    },
    similar,
    otherByAuthor: others,
  }
}

const js = `/** Auto-generated by scripts/enrich-details.mjs */
export const enrichments = ${JSON.stringify(enrichments, null, 2)};

export function enrichmentFor(shelfId, index) {
  return enrichments[\`\${shelfId}-\${index}\`] || null;
}
`

await writeFile(path.join(root, 'src/enrichments.js'), js)
await writeFile(
  path.join(root, 'public/authors/CREDITS.md'),
  `# Author photos

Author photographs fetched from Open Library and Wikipedia/Wikimedia thumbnails for educational display in the Library bookshelf detail panel.

Generated ${new Date().toISOString()}
`,
)

console.log('Done enriching', Object.keys(enrichments).length, 'books')
console.log('Authors cached', authorCache.size)
