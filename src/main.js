import './style.css'
import { shelves, countBooks } from './catalog.js'

const MATERIALS = ['leather', 'cloth', 'paper', 'board']
const PALETTES = [
  { bg: '#3a2218', ink: '#e8d5a8', band: '#8b6914' },
  { bg: '#1e2a1c', ink: '#d4c4a0', band: '#6b8f71' },
  { bg: '#2c1810', ink: '#f0e0c0', band: '#a67c52' },
  { bg: '#1a2433', ink: '#c9d4e0', band: '#5a7a9a' },
  { bg: '#4a1c1c', ink: '#f0d0b0', band: '#c4a35a' },
  { bg: '#2a1f14', ink: '#e0d0b0', band: '#8a7040' },
  { bg: '#1c2830', ink: '#d8e0d0', band: '#4a6a5a' },
  { bg: '#3d2a18', ink: '#f5e6c8', band: '#b8860b' },
  { bg: '#241820', ink: '#e8d0d8', band: '#8b4557' },
  { bg: '#2f2a20', ink: '#efe6d0', band: '#7a6a40' },
  { bg: '#152218', ink: '#c8d8c0', band: '#3d6b4f' },
  { bg: '#3b2f1e', ink: '#f2e8d0', band: '#9c7a3c' },
  { bg: '#201818', ink: '#e8d8c8', band: '#6a4a3a' },
  { bg: '#1a2030', ink: '#d0d8e8', band: '#4a5a8a' },
  { bg: '#332820', ink: '#f0e4cc', band: '#a08050' },
]

function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function bookStyle(book, index) {
  const h = hashString(`${book.title}:${book.author}:${index}`)
  const palette = PALETTES[h % PALETTES.length]
  const material = MATERIALS[h % MATERIALS.length]
  const height = 148 + (h % 56)
  const width = 28 + (h % 22)
  const lean = ((h >> 8) % 5) - 2
  const fontSize = Math.max(9, Math.min(12, width * 0.38))
  return { palette, material, height, width, lean, fontSize }
}

let selectedId = null
let lightX = 50

function bookId(shelfId, index) {
  return `${shelfId}-${index}`
}

function renderApp() {
  const app = document.querySelector('#app')
  app.innerHTML = `
    <div class="atmosphere" aria-hidden="true">
      <div class="lamp-glow"></div>
      <div class="dust"></div>
      <div class="grain"></div>
    </div>

    <header class="hero">
      <p class="hero-eyebrow">A private study</p>
      <h1 class="brand">Library</h1>
      <p class="hero-tag">Warm wood, soft light, and a shelf for every volume worth keeping.</p>
    </header>

    <main class="room" id="room">
      ${shelves.map((shelf) => renderShelf(shelf)).join('')}
    </main>

    <footer class="colophon">
      <span>${countBooks()} volumes</span>
      <span aria-hidden="true">·</span>
      <span>Four shelves</span>
    </footer>

    <div
      class="panel-backdrop"
      id="panel-backdrop"
      hidden
      data-close
    ></div>
    <aside
      class="detail-panel"
      id="detail-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
      hidden
    >
      <button type="button" class="panel-close" id="panel-close" aria-label="Close book details">
        <span aria-hidden="true">×</span>
      </button>
      <p class="detail-category" id="detail-category"></p>
      <h2 class="detail-title" id="detail-title"></h2>
      <p class="detail-author" id="detail-author"></p>
      <p class="detail-description" id="detail-description"></p>
    </aside>
  `

  bindEvents()
}

function renderShelf(shelf) {
  return `
    <section class="shelf-block" data-shelf="${shelf.id}" aria-labelledby="shelf-${shelf.id}">
      <div class="shelf-heading">
        <h2 id="shelf-${shelf.id}">${shelf.label}</h2>
        <p>${shelf.books.length} books</p>
      </div>
      <div class="shelf-frame">
        <div class="shelf-rail top" aria-hidden="true"></div>
        <div class="book-row" role="list" aria-label="${shelf.label}">
          ${shelf.books
            .map((book, index) => renderBook(shelf, book, index))
            .join('')}
        </div>
        <div class="shelf-plank" aria-hidden="true">
          <div class="shelf-edge"></div>
          <div class="shelf-shadow"></div>
        </div>
      </div>
    </section>
  `
}

function renderBook(shelf, book, index) {
  const style = bookStyle(book, index)
  const id = bookId(shelf.id, index)
  const selected = selectedId === id
  return `
    <button
      type="button"
      class="book ${style.material}${selected ? ' is-selected' : ''}"
      role="listitem"
      data-book-id="${id}"
      data-shelf="${shelf.id}"
      data-index="${index}"
      aria-label="${escapeAttr(book.title)} by ${escapeAttr(book.author)}"
      aria-pressed="${selected}"
      style="
        --book-h: ${style.height}px;
        --book-w: ${style.width}px;
        --book-bg: ${style.palette.bg};
        --book-ink: ${style.palette.ink};
        --book-band: ${style.palette.band};
        --book-lean: ${style.lean}deg;
        --spine-size: ${style.fontSize}px;
      "
    >
      <span class="book-face">
        <span class="spine-band top"></span>
        <span class="spine-title">${escapeHtml(book.spine)}</span>
        <span class="spine-band bottom"></span>
        <span class="spine-sheen"></span>
      </span>
    </button>
  `
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("'", '&#39;')
}

function findBook(id) {
  const [shelfId, indexStr] = id.split(/-(?=\d+$)/)
  const shelf = shelves.find((s) => s.id === shelfId)
  if (!shelf) return null
  const index = Number(indexStr)
  const book = shelf.books[index]
  if (!book) return null
  return { shelf, book, index }
}

function openPanel(id) {
  const found = findBook(id)
  if (!found) return
  selectedId = id
  const { shelf, book } = found
  const panel = document.getElementById('detail-panel')
  const backdrop = document.getElementById('panel-backdrop')

  document.getElementById('detail-category').textContent = shelf.category
  document.getElementById('detail-title').textContent = book.title
  document.getElementById('detail-author').textContent = book.author
  document.getElementById('detail-description').textContent = book.description

  panel.hidden = false
  backdrop.hidden = false
  requestAnimationFrame(() => {
    panel.classList.add('is-open')
    backdrop.classList.add('is-open')
  })

  document.querySelectorAll('.book').forEach((el) => {
    const match = el.dataset.bookId === id
    el.classList.toggle('is-selected', match)
    el.setAttribute('aria-pressed', String(match))
  })

  document.getElementById('panel-close').focus()
}

function closePanel() {
  const panel = document.getElementById('detail-panel')
  const backdrop = document.getElementById('panel-backdrop')
  const prev = selectedId
  selectedId = null
  panel.classList.remove('is-open')
  backdrop.classList.remove('is-open')

  window.setTimeout(() => {
    if (!selectedId) {
      panel.hidden = true
      backdrop.hidden = true
    }
  }, 280)

  document.querySelectorAll('.book').forEach((el) => {
    el.classList.remove('is-selected')
    el.setAttribute('aria-pressed', 'false')
  })

  if (prev) {
    const btn = document.querySelector(`[data-book-id="${prev}"]`)
    btn?.focus()
  }
}

function bindEvents() {
  document.getElementById('room').addEventListener('click', (event) => {
    const btn = event.target.closest('.book')
    if (!btn) return
    openPanel(btn.dataset.bookId)
  })

  document.getElementById('panel-close').addEventListener('click', closePanel)
  document.getElementById('panel-backdrop').addEventListener('click', closePanel)

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && selectedId) {
      event.preventDefault()
      closePanel()
    }
  })

  const room = document.getElementById('room')
  room.addEventListener(
    'pointermove',
    (event) => {
      const rect = room.getBoundingClientRect()
      lightX = ((event.clientX - rect.left) / rect.width) * 100
      document.documentElement.style.setProperty('--light-x', `${lightX}%`)
    },
    { passive: true },
  )

  // Gentle ambient drift of lamp light
  let t = 0
  const drift = () => {
    t += 0.004
    const ambient = 50 + Math.sin(t) * 8
    document.documentElement.style.setProperty('--light-drift', `${ambient}%`)
    requestAnimationFrame(drift)
  }
  requestAnimationFrame(drift)
}

renderApp()
