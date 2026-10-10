/**
 * Harder cover search for catalog gaps: Open Library variants,
 * Internet Archive, Google Books. Merges into covers-data.js.
 */
import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { createWriteStream, existsSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const { shelves } = await import(path.join(root, 'src/catalog.js'))
const { covers } = await import(path.join(root, 'src/covers-data.js'))

const outDir = path.join(root, 'public/covers')
await mkdir(outDir, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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

function simplifyTitle(title) {
  return title
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/,?\s*Vols?\.\s*[IVXLC\d]+.*$/iu, '')
    .replace(/,?\s*Volume\s+[IVXLC\d]+.*$/iu, '')
    .replace(/:\s*.*$/u, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function titleLooksRelated(a, b) {
  const na = norm(a)
  const nb = norm(b)
  if (!na || !nb) return false
  if (na.includes(nb.slice(0, 16)) || nb.includes(na.slice(0, 16))) return true
  const wa = new Set(na.split(' ').filter((w) => w.length > 3))
  const wb = nb.split(' ').filter((w) => w.length > 3)
  const hit = wb.filter((w) => wa.has(w)).length
  return hit >= Math.min(2, wb.length)
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'LibraryBookshelf/1.0 (educational; cover recovery)',
    },
  })
  if (!res.ok) return null
  return res.json()
}

async function downloadImage(url, dest) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LibraryBookshelf/1.0 (educational; cover recovery)' },
      redirect: 'follow',
    })
    if (!res.ok || !res.body) return false
    const ctype = res.headers.get('content-type') || ''
    if (!ctype.includes('image') && !ctype.includes('octet-stream')) return false
    // Skip tiny placeholders
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 2500) return false
    await writeFile(dest, buf)
    return true
  } catch {
    return false
  }
}

async function tryOpenLibrary(title, author) {
  const variants = [
    { title, author },
    { title: simplifyTitle(title), author },
    { title: simplifyTitle(title), author: '' },
    { q: `${simplifyTitle(title)} ${primaryAuthor(author)}` },
  ]
  for (const v of variants) {
    let url
    if (v.q) {
      url = `https://openlibrary.org/search.json?q=${encodeURIComponent(v.q)}&limit=12`
    } else {
      const params = new URLSearchParams({ title: v.title.slice(0, 120), limit: '12' })
      if (v.author) params.set('author', primaryAuthor(v.author).slice(0, 60))
      url = `https://openlibrary.org/search.json?${params}`
    }
    const data = await fetchJson(url)
    await sleep(90)
    const docs = (data?.docs || []).filter((d) => d.cover_i)
    const pick =
      docs.find((d) => titleLooksRelated(title, d.title)) ||
      docs.find((d) => titleLooksRelated(simplifyTitle(title), d.title)) ||
      null
    if (pick?.cover_i) {
      return {
        coverUrl: `https://covers.openlibrary.org/b/id/${pick.cover_i}-L.jpg`,
        source: 'Open Library',
        sourceUrl: pick.key ? `https://openlibrary.org${pick.key}` : 'https://openlibrary.org',
        match: { title: pick.title, author: pick.author_name?.[0] || '' },
        coverId: pick.cover_i,
      }
    }
  }
  return null
}

async function tryGoogleBooks(title, author) {
  const q = `intitle:${simplifyTitle(title)}${author ? `+inauthor:${primaryAuthor(author).split(' ').slice(-1)[0]}` : ''}`
  const data = await fetchJson(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8`,
  )
  await sleep(100)
  const items = data?.items || []
  for (const item of items) {
    const info = item.volumeInfo || {}
    if (!titleLooksRelated(title, info.title || '')) continue
    const links = info.imageLinks || {}
    let img =
      links.extraLarge ||
      links.large ||
      links.medium ||
      links.thumbnail ||
      links.smallThumbnail
    if (!img) continue
    img = img.replace(/^http:/, 'https:').replace(/&edge=curl/, '').replace(/zoom=\d/, 'zoom=2')
    return {
      coverUrl: img,
      source: 'Google Books',
      sourceUrl: info.infoLink || info.canonicalVolumeLink || 'https://books.google.com',
      match: { title: info.title, author: (info.authors || [])[0] || '' },
    }
  }
  return null
}

async function tryInternetArchive(title, author) {
  const t = simplifyTitle(title)
  const a = primaryAuthor(author)
  const query = a
    ? `title:("${t}") AND creator:(${a.split(' ').slice(-1)[0]})`
    : `title:("${t}")`
  const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}&fl[]=identifier&fl[]=title&fl[]=creator&rows=8&page=1&output=json`
  const data = await fetchJson(url)
  await sleep(100)
  const docs = data?.response?.docs || []
  for (const doc of docs) {
    if (!titleLooksRelated(title, doc.title || '')) continue
    const coverUrl = `https://archive.org/services/img/${doc.identifier}`
    return {
      coverUrl,
      source: 'Internet Archive',
      sourceUrl: `https://archive.org/details/${doc.identifier}`,
      match: { title: doc.title, author: Array.isArray(doc.creator) ? doc.creator[0] : doc.creator || '' },
    }
  }
  return null
}

async function tryOpenLibraryEditions(title, author) {
  // Broader q search then drill into editions for cover
  const q = `${simplifyTitle(title)} ${primaryAuthor(author)}`.trim()
  const data = await fetchJson(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8`,
  )
  await sleep(90)
  for (const doc of data?.docs || []) {
    if (!titleLooksRelated(title, doc.title || '') && !titleLooksRelated(simplifyTitle(title), doc.title || '')) {
      continue
    }
    if (doc.cover_i) {
      return {
        coverUrl: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
        source: 'Open Library',
        sourceUrl: doc.key ? `https://openlibrary.org${doc.key}` : 'https://openlibrary.org',
        match: { title: doc.title, author: doc.author_name?.[0] || '' },
        coverId: doc.cover_i,
      }
    }
    if (doc.cover_edition_key) {
      return {
        coverUrl: `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-L.jpg`,
        source: 'Open Library',
        sourceUrl: `https://openlibrary.org/books/${doc.cover_edition_key}`,
        match: { title: doc.title, author: doc.author_name?.[0] || '' },
      }
    }
    // Try first ISBN
    const isbn = doc.isbn?.[0]
    if (isbn) {
      return {
        coverUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
        source: 'Open Library',
        sourceUrl: `https://openlibrary.org/isbn/${isbn}`,
        match: { title: doc.title, author: doc.author_name?.[0] || '' },
      }
    }
  }
  return null
}

const missing = []
for (const shelf of shelves) {
  shelf.books.forEach((book, index) => {
    const id = `${shelf.id}-${index}`
    if (!covers[id]?.cover) missing.push({ id, shelfId: shelf.id, index, book })
  })
}

console.log(`Recovering covers for ${missing.length} gaps…`)
let recovered = 0

for (const item of missing) {
  const { id, book } = item
  const dest = path.join(outDir, `${id}.jpg`)
  process.stdout.write(`${id} … `)

  const attempts = [
    () => tryOpenLibrary(book.title, book.author),
    () => tryOpenLibraryEditions(book.title, book.author),
    () => tryGoogleBooks(book.title, book.author),
    () => tryInternetArchive(book.title, book.author),
  ]

  let hit = null
  for (const attempt of attempts) {
    hit = await attempt()
    if (hit?.coverUrl) break
  }

  if (!hit?.coverUrl) {
    console.log('still missing')
    continue
  }

  const ok = await downloadImage(hit.coverUrl, dest)
  if (!ok) {
    console.log('download failed', hit.source)
    continue
  }

  covers[id] = {
    cover: `covers/${id}.jpg`,
    spine: `covers/${id}.jpg`,
    source: hit.source,
    sourceUrl: hit.sourceUrl,
    coverId: hit.coverId || null,
    match: hit.match,
    gap: !titleLooksRelated(book.title, hit.match?.title || ''),
    note: titleLooksRelated(book.title, hit.match?.title || '')
      ? null
      : `Closest match: “${hit.match?.title || ''}”`,
  }
  recovered++
  console.log('OK', hit.source, '—', hit.match?.title)
}

const js = `/** Auto-generated by scripts/fetch-covers.mjs — Open Library covers */
export const covers = ${JSON.stringify(covers, null, 2)};

export function coverFor(shelfId, index) {
  return covers[\`\${shelfId}-\${index}\`] || null;
}
`

await writeFile(path.join(root, 'src/covers-data.js'), js)

const still = Object.values(covers).filter((c) => !c.cover).length
const have = Object.values(covers).filter((c) => c.cover).length
console.log(`\nRecovered ${recovered}. Covers now: ${have}/117 (${still} still missing)`)
