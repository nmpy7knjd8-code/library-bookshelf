import './style.css'
import { shelves, countBooks } from './catalog.js'
import { relatedClusters, worthExploring } from './discoveries.js'
import { spineTextureUrl, hashString } from './textures.js'
import { coverFor } from './covers-data.js'

const MATERIALS = ['leather', 'cloth', 'paper', 'board']
const PALETTES = [
  { bg: '#2a1814', ink: '#e8d4a8', band: '#c4a35a', pages: '#e8e0d0' },
  { bg: '#1a2420', ink: '#d0d8c8', band: '#8a9a7a', pages: '#e6e2d6' },
  { bg: '#1c1410', ink: '#f0e0c0', band: '#a67c52', pages: '#efe6d4' },
  { bg: '#121820', ink: '#c8d4e4', band: '#6a8aaa', pages: '#e4e6ea' },
  { bg: '#3a1414', ink: '#f0d0b0', band: '#c4a35a', pages: '#ebe4d4' },
  { bg: '#1a1612', ink: '#e0d0b0', band: '#8a7040', pages: '#e8e2d4' },
  { bg: '#101818', ink: '#d0ddd4', band: '#5a8a7a', pages: '#e2e6e0' },
  { bg: '#2c2010', ink: '#f5e6c8', band: '#d4af37', pages: '#efe6d0' },
  { bg: '#18101a', ink: '#e0d0d8', band: '#9a6a7a', pages: '#e8e0e4' },
  { bg: '#221c14', ink: '#efe6d0', band: '#9a8a50', pages: '#ebe4d6' },
  { bg: '#0e1814', ink: '#c8d8c8', band: '#4a7a5a', pages: '#e0e6e0' },
  { bg: '#2a2218', ink: '#f2e8d0', band: '#b09050', pages: '#efe8d8' },
  { bg: '#141010', ink: '#e0d4c8', band: '#7a5a4a', pages: '#e8e2d8' },
  { bg: '#101420', ink: '#c8d0e8', band: '#5a6a9a', pages: '#e2e4ea' },
  { bg: '#241c14', ink: '#f0e4cc', band: '#a88848', pages: '#ebe4d4' },
]

let selectedId = null
let lastRowWidth = 0

function bookId(shelfId, index) {
  return `${shelfId}-${index}`
}

function assetUrl(rel) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${rel.replace(/^\//, '')}`
}

/** Available width for books inside the case — never wider than the viewport. */
function rowCapacity() {
  const caseW = Math.min(window.innerWidth * 0.94, 560)
  const upright = window.innerWidth < 720 ? 36 : 72
  const pad = 28
  return Math.max(200, Math.floor(caseW - upright - pad))
}

function widthScale() {
  const cap = rowCapacity()
  if (cap < 280) return 0.78
  if (cap < 360) return 0.88
  return 1
}

function bookStyle(book, index) {
  const h = hashString(`${book.title}:${book.author}:${index}`)
  const palette = PALETTES[h % PALETTES.length]
  const material = MATERIALS[h % MATERIALS.length]
  const scale = widthScale()
  const height = Math.round((148 + (h % 44)) * Math.min(1, scale + 0.08))
  const width = Math.max(18, Math.round((24 + (h % 14)) * scale))
  const lean = ((h >> 8) % 5) - 2
  const fontSize = Math.max(8, Math.min(11, width * 0.36))
  const inkMode = h % 3 === 0 ? 'foil' : h % 3 === 1 ? 'blind' : 'ink'
  const texture = spineTextureUrl({
    key: `${book.title}:${index}`,
    material,
    bg: palette.bg,
    band: palette.band,
  })
  return { palette, material, height, width, lean, fontSize, inkMode, texture }
}

function chunkIntoRows(shelf) {
  const maxW = rowCapacity()
  const rows = []
  let current = []
  let used = 0
  shelf.books.forEach((book, index) => {
    const style = bookStyle(book, index)
    const w = style.width + 2
    if (current.length && used + w > maxW) {
      rows.push(current)
      current = []
      used = 0
    }
    current.push({ book, index, style })
    used += w
  })
  if (current.length) rows.push(current)
  return rows
}

function applyWoodAssets() {
  const root = document.documentElement
  root.style.setProperty('--wood-case', `url('${assetUrl('textures/wood-case.jpg')}')`)
  root.style.setProperty('--wood-dark', `url('${assetUrl('textures/wood-dark.jpg')}')`)
  root.style.setProperty('--wood-plank', `url('${assetUrl('textures/wood-plank.jpg')}')`)
  root.style.setProperty('--wood-grain', `url('${assetUrl('textures/wood-grain.jpg')}')`)
}

function renderDiscoveryPanel(id, title, blurb, bodyHtml) {
  return `
    <div class="discovery-panel" data-discovery="${id}">
      <button
        type="button"
        class="discovery-toggle"
        id="discovery-toggle-${id}"
        aria-expanded="false"
        aria-controls="discovery-panel-${id}"
      >
        <span class="discovery-label">
          <span class="discovery-title">${escapeHtml(title)}</span>
          <span class="discovery-blurb">${escapeHtml(blurb)}</span>
        </span>
        <span class="discovery-mark" aria-hidden="true"></span>
      </button>
      <div
        class="discovery-body"
        id="discovery-panel-${id}"
        role="region"
        aria-labelledby="discovery-toggle-${id}"
        hidden
      >
        ${bodyHtml}
      </div>
    </div>
  `
}

function lookupShelfBook(title) {
  for (const shelf of shelves) {
    const index = shelf.books.findIndex((b) => b.title === title)
    if (index !== -1) {
      return { shelf, book: shelf.books[index], index, id: bookId(shelf.id, index) }
    }
  }
  return null
}

function renderRelatedBody() {
  return `
    <div class="cluster-list">
      ${relatedClusters
        .map(
          (cluster) => `
        <article class="cluster">
          <h3 class="cluster-title">${escapeHtml(cluster.title)}</h3>
          <p class="cluster-note">${escapeHtml(cluster.note)}</p>
          <ul class="cluster-titles">
            ${cluster.titles
              .map((title) => {
                const found = lookupShelfBook(title)
                if (!found) {
                  return `<li><span class="cluster-missing">${escapeHtml(title)}</span></li>`
                }
                return `
                  <li>
                    <button type="button" class="cluster-link" data-book-id="${escapeAttr(found.id)}">
                      <span class="cluster-link-title">${escapeHtml(found.book.title)}</span>
                      <span class="cluster-link-author">${escapeHtml(found.book.author)}</span>
                    </button>
                  </li>`
              })
              .join('')}
          </ul>
        </article>`,
        )
        .join('')}
    </div>
  `
}

function renderExploreBody() {
  return `
    <ul class="explore-list">
      ${worthExploring
        .map(
          (item) => `
        <li class="explore-item">
          <div class="explore-heading">
            <span class="explore-title">${escapeHtml(item.title)}</span>
            <span class="explore-author">${escapeHtml(item.author)}</span>
          </div>
          <p class="explore-why">${escapeHtml(item.why)}</p>
        </li>`,
        )
        .join('')}
    </ul>
  `
}

function renderShelfSection(shelf) {
  const rows = chunkIntoRows(shelf)
  return `
    <section class="bay-section" data-shelf="${shelf.id}" aria-labelledby="shelf-${shelf.id}">
      <div class="bay-heading">
        <h2 id="shelf-${shelf.id}">${shelf.label}</h2>
        <p>${shelf.books.length}</p>
      </div>
      ${rows
        .map(
          (row, rowIndex) => `
        <div class="bay-recess" data-row="${rowIndex}">
          <div class="bay-back" aria-hidden="true"></div>
          <div class="bay-spotlight" aria-hidden="true"></div>
          <div class="book-row" role="list" aria-label="${shelf.label} row ${rowIndex + 1}">
            ${row.map(({ book, index, style }) => renderBook(shelf, book, index, style)).join('')}
          </div>
          <div class="shelf-board" aria-hidden="true">
            <div class="shelf-top-face"></div>
            <div class="shelf-front-lip"></div>
            <div class="shelf-under-shadow"></div>
          </div>
        </div>`,
        )
        .join('')}
    </section>
  `
}

function renderBook(shelf, book, index, style) {
  const id = bookId(shelf.id, index)
  const selected = selectedId === id
  const cover = coverFor(shelf.id, index)
  const hasReal = cover?.cover
  const spineImg = hasReal ? assetUrl(cover.spine || cover.cover) : null
  return `
    <button
      type="button"
      class="book material-${style.material} ink-${style.inkMode}${selected ? ' is-selected' : ''}${hasReal ? ' has-photo' : ''}"
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
        --book-pages: ${style.palette.pages};
        --book-lean: ${style.lean}deg;
        --spine-size: ${style.fontSize}px;
        --spine-texture: url('${style.texture}');
        ${spineImg ? `--spine-photo: url('${spineImg}');` : ''}
      "
    >
      <span class="book-block">
        <span class="book-spine">
          ${
            hasReal
              ? `<span class="spine-photo" role="img" aria-hidden="true"></span>
                 <span class="spine-photo-shade"></span>
                 <span class="spine-title photo-title">${escapeHtml(book.spine)}</span>`
              : `<span class="spine-skin"></span>
                 <span class="spine-title">${escapeHtml(book.spine)}</span>
                 <span class="spine-edge-light"></span>
                 <span class="spine-wear"></span>`
          }
        </span>
        <span class="book-pages" aria-hidden="true"></span>
        <span class="book-head" aria-hidden="true"></span>
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
  const { shelf, book, index } = found
  const panel = document.getElementById('detail-panel')
  const backdrop = document.getElementById('panel-backdrop')
  const coverMeta = coverFor(shelf.id, index)
  const coverWrap = document.getElementById('detail-cover-wrap')
  const coverImg = document.getElementById('detail-cover')
  const sourceEl = document.getElementById('detail-source')

  document.getElementById('detail-category').textContent = shelf.category
  document.getElementById('detail-title').textContent = book.title
  document.getElementById('detail-author').textContent = book.author
  document.getElementById('detail-description').textContent = book.description

  if (coverMeta?.cover) {
    coverImg.src = assetUrl(coverMeta.cover)
    coverImg.alt = `Cover of ${book.title}`
    coverWrap.hidden = false
    const bits = []
    if (coverMeta.source) bits.push(`Cover: ${coverMeta.source}`)
    if (coverMeta.note) bits.push(coverMeta.note)
    if (bits.length) {
      sourceEl.hidden = false
      sourceEl.textContent = bits.join(' · ')
    } else {
      sourceEl.hidden = true
    }
  } else {
    coverWrap.hidden = true
    coverImg.removeAttribute('src')
    sourceEl.hidden = false
    sourceEl.textContent = 'Cover image not found in Open Library for this edition yet.'
  }

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
    document.querySelector(`[data-book-id="${prev}"]`)?.focus()
  }
}

function setDiscoveryOpen(panel, open) {
  const toggle = panel.querySelector('.discovery-toggle')
  const body = panel.querySelector('.discovery-body')
  toggle.setAttribute('aria-expanded', String(open))
  panel.classList.toggle('is-open', open)
  if (open) {
    body.hidden = false
    requestAnimationFrame(() => body.classList.add('is-open'))
  } else {
    body.classList.remove('is-open')
    window.setTimeout(() => {
      if (!panel.classList.contains('is-open')) body.hidden = true
    }, 280)
  }
}

function bindEvents() {
  document.getElementById('room').addEventListener('click', (event) => {
    const btn = event.target.closest('.book')
    if (!btn) return
    openPanel(btn.dataset.bookId)
  })

  const discovery = document.querySelector('.discovery')
  discovery.addEventListener('click', (event) => {
    const toggle = event.target.closest('.discovery-toggle')
    if (toggle) {
      const panel = toggle.closest('.discovery-panel')
      const open = toggle.getAttribute('aria-expanded') !== 'true'
      discovery.querySelectorAll('.discovery-panel').forEach((other) => {
        if (other !== panel) setDiscoveryOpen(other, false)
      })
      setDiscoveryOpen(panel, open)
      return
    }

    const link = event.target.closest('.cluster-link')
    if (link) {
      openPanel(link.dataset.bookId)
      document
        .querySelector(`[data-book-id="${link.dataset.bookId}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  })

  document.getElementById('panel-close').addEventListener('click', closePanel)
  document.getElementById('panel-backdrop').addEventListener('click', closePanel)

  const room = document.getElementById('room')
  room.addEventListener(
    'pointermove',
    (event) => {
      const rect = room.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 100
      document.documentElement.style.setProperty('--light-x', `${x}%`)
    },
    { passive: true },
  )
}

let globalsBound = false
function bindGlobalsOnce() {
  if (globalsBound) return
  globalsBound = true

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && selectedId) {
      event.preventDefault()
      closePanel()
    }
  })

  let t = 0
  const drift = () => {
    t += 0.0035
    document.documentElement.style.setProperty('--light-drift', `${48 + Math.sin(t) * 10}%`)
    requestAnimationFrame(drift)
  }
  requestAnimationFrame(drift)

  let resizeTimer = 0
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => {
      const next = rowCapacity()
      if (Math.abs(next - lastRowWidth) < 12) return
      const openId = selectedId
      renderApp()
      if (openId) openPanel(openId)
    }, 120)
  })
}

function renderApp() {
  applyWoodAssets()
  lastRowWidth = rowCapacity()
  document.documentElement.style.setProperty(
    '--case-width',
    `${Math.min(window.innerWidth * 0.94, 560)}px`,
  )
  const app = document.querySelector('#app')
  // Preserve selected state across reflow by rebuilding markup below
  const html = buildAppHtml()
  app.innerHTML = html
  bindEvents()
  bindGlobalsOnce()
}

function buildAppHtml() {
  return `
    <div class="atmosphere" aria-hidden="true">
      <div class="spot spot-a"></div>
      <div class="spot spot-b"></div>
      <div class="spot spot-c"></div>
      <div class="vignette"></div>
      <div class="grain"></div>
    </div>

    <header class="hero">
      <p class="hero-eyebrow">A private study</p>
      <h1 class="brand">Library</h1>
      <p class="hero-tag">A tall case in cool light — real wood, real spines, volumes stacked floor to crown.</p>
    </header>

    <main class="room" id="room">
      <div class="bookcase" id="bookcase">
        <div class="case-crown" aria-hidden="true"></div>
        <div class="case-body">
          <div class="case-upright left" aria-hidden="true"></div>
          <div class="case-bays">
            ${shelves.map((shelf) => renderShelfSection(shelf)).join('')}
          </div>
          <div class="case-upright right" aria-hidden="true"></div>
        </div>
        <div class="case-plinth" aria-hidden="true"></div>
      </div>
    </main>

    <section class="discovery" aria-label="Further discovery">
      ${renderDiscoveryPanel(
        'related',
        'Related books',
        'Connections among volumes on these shelves',
        renderRelatedBody(),
      )}
      ${renderDiscoveryPanel(
        'explore',
        'Worth exploring',
        'Further reading beyond the case',
        renderExploreBody(),
      )}
    </section>

    <footer class="colophon">
      <span>${countBooks()} volumes</span>
      <span aria-hidden="true">·</span>
      <span>One upright case</span>
    </footer>

    <div class="panel-backdrop" id="panel-backdrop" hidden data-close></div>
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
      <div class="detail-cover-wrap" id="detail-cover-wrap" hidden>
        <img class="detail-cover" id="detail-cover" alt="" />
      </div>
      <p class="detail-category" id="detail-category"></p>
      <h2 class="detail-title" id="detail-title"></h2>
      <p class="detail-author" id="detail-author"></p>
      <p class="detail-description" id="detail-description"></p>
      <p class="detail-source" id="detail-source" hidden></p>
    </aside>
  `
}

renderApp()
