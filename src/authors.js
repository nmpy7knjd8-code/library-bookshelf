import { shelves } from './catalog.js'

const NON_PERSON = /^(author uncertain|various contributors|anthology|american standard version|american literature survey|farm and fireside)/i
const AUTHOR_ALIASES = { 'Carl G. Jung': 'C. G. Jung' }
const SURNAME_OVERRIDES = { 'Dante Alighieri': 'Dante' }
export const VARIOUS = 'Anthologies & Various'

/** Split a catalog author string into normalised person names. */
export function authorNames(raw) {
  const a = String(raw || '').trim()
  if (!a || NON_PERSON.test(a)) return [VARIOUS]
  let t = a
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/,\s*edited by .*$/i, '')
    .replace(/^(edited by|associated with)\s+/i, '')
    .replace(/,?\s*et al\.?/i, '')
    .trim()
  return t
    .split(/\s*,\s*|\s+and\s+/)
    .map((n) => n.trim())
    .filter(Boolean)
    .map((n) => AUTHOR_ALIASES[n] || n)
}

export function surnameKey(name) {
  if (name === VARIOUS) return '\uffff'
  if (SURNAME_OVERRIDES[name]) return SURNAME_OVERRIDES[name]
  const parts = name.replace(/\s+Jr\.?$/i, '').split(/\s+/)
  return `${parts[parts.length - 1]} ${parts.slice(0, -1).join(' ')}`
}

export function buildAuthorIndex() {
  const map = new Map()
  for (const shelf of shelves) {
    shelf.books.forEach((book, index) => {
      for (const name of authorNames(book.author)) {
        if (!map.has(name)) map.set(name, [])
        map.get(name).push({ shelf, book, index })
      }
    })
  }
  return [...map.entries()]
    .map(([name, books]) => ({ name, books, key: surnameKey(name) }))
    .sort(
      (x, y) =>
        (x.name === VARIOUS) - (y.name === VARIOUS) ||
        y.books.length - x.books.length ||
        x.key.localeCompare(y.key, 'en', { sensitivity: 'base' }),
    )
}

