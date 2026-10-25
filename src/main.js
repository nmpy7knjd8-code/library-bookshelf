import './style.css'
import { shelves, countBooks } from './catalog.js'
import { relatedClusters, worthExploring } from './discoveries.js'
import { spineTextureUrl, hashString } from './textures.js'
import { coverFor } from './covers-data.js'
import { enrichmentFor } from './enrichments.js'

let selectedId = null
let lastRowWidth = 0
let activeView = 'covers' // 'shelf' | 'covers' | 'authors'

function bookId(shelfId, index) {
  return `${shelfId}-${index}`
}

function assetUrl(rel) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${rel.replace(/^\//, '')}`
}

/** Visible case width — two long horizontal stacks scroll inside the bays. */
function caseWidthPx() {
  return Math.min(window.innerWidth * 0.96, 650)
}

/** Full title for the spine — keep wording; strip only edition/series noise */
function fullSpineTitle(book) {
  let t = (book.title || '').replace(/\s+/g, ' ').replace(/[’‘]/g, "'").trim()
  // Remove trailing parenthetical edition notes
  t = t.replace(/\s*\([^)]*(?:edition|ed\.|press|oxford|cambridge|with references)[^)]*\)\s*$/iu, '').trim()
  t = t.replace(/\s*\([^)]{16,}\)\s*$/u, '').trim()
  return t
}

/** Last resort only — keep as many whole words as possible */
function shortenTitleLastResort(title, maxChars) {
  if (title.length <= maxChars) return title
  // Drop volume / part suffixes first (still readable as the work)
  let t = title
    .replace(/,?\s*Vols?\.\s*[IVXLC\d]+.*$/iu, '')
    .replace(/,?\s*Volume\s+[IVXLC\d]+.*$/iu, '')
    .replace(/:\s*.*$/u, '')
    .trim()
  if (t.length <= maxChars) return t
  let out = ''
  for (const word of t.split(' ')) {
    const next = out ? `${out} ${word}` : word
    if (next.length > maxChars) break
    out = next
  }
  return out.length >= 12 ? out : t.slice(0, maxChars).trim()
}

function spineAuthor(author) {
  if (!author) return ''
  let a = author
    .replace(/^edited by\s+/i, '')
    .replace(/^associated with\s+/i, '')
    .replace(/^tr\.?\s+/i, '')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .split(/[;,/]/)[0]
    .trim()
  const parts = a.split(/\s+/).filter(Boolean)
  if (parts.length > 3) a = parts.slice(-2).join(' ')
  if (a.length > 24) a = `${a.slice(0, 22)}…`
  return a
}

/** Realistic spine generation — varied heights, widths, bindings; fixed legible type. */
const NARROW = () => window.innerWidth < 500
const SPINE_TITLE_SIZE = 17
const SPINE_AUTHOR_SIZE = 12
const ROW_MAX_H = 270

/* Real-world binding colourways: [bg, ink, band, pages, inkTone] */
const BINDINGS = [
  ['#5a1a17', '#ecd8a0', '#c9a24e', '#e9dfc9', 'gold'],   // oxblood leather
  ['#1d2b45', '#e8d7a4', '#c4a35a', '#ebe3d0', 'gold'],   // navy cloth
  ['#23382b', '#ead9a6', '#b8984f', '#e6dfcc', 'gold'],   // forest green
  ['#6b4a2b', '#f1e3bd', '#d9b46a', '#efe5cf', 'gold'],   // tan calf
  ['#2a221d', '#e9d9ad', '#b4924e', '#e6ddc9', 'gold'],   // black-brown
  ['#e9e1cc', '#2a211a', '#8a2a22', '#f1eadb', 'dark'],   // cream paper (LoA/Penguin-ish)
  ['#c8b38a', '#2b2117', '#5b3a22', '#efe6d1', 'dark'],   // buckram natural
  ['#8c2f22', '#f3e7c8', '#e3c27a', '#ece2cd', 'gold'],   // brick red
  ['#3b4a5c', '#f1ead6', '#d2c39a', '#eae4d6', 'light'],  // slate cloth
  ['#d9cfb8', '#1d1d1d', '#1d1d1d', '#f3eee2', 'dark'],   // off-white modern
  ['#14161a', '#f2efe6', '#c9b37a', '#e9e3d6', 'light'],  // black modern
  ['#7a6a3a', '#f4ead0', '#e8d39a', '#efe7d2', 'light'],  // olive
  ['#4a2b42', '#efdfb6', '#caa860', '#ebe2d0', 'gold'],   // plum
  ['#a77a3f', '#20160c', '#4a2c12', '#f0e6cf', 'dark'],   // ochre
  ['#2f4d57', '#f0e7cc', '#d6bf86', '#e8e2d3', 'light'],  // teal
]
const STYLES = ['bands', 'label', 'plain', 'modern', 'bands', 'label']

function bookStyle(book, index) {
  const h = hashString(`${book.title}:${book.author}:${index}`)
  const h2 = hashString(`${book.author}|${index}|r`)
  // Optional per-book binding (real spine colour from the owner's copy); otherwise hashed colourway
  const own = book.binding
  const [bg, ink, band, pages, tone] = own
    ? [own.bg, own.ink, own.band || own.ink, own.pages || '#ebe3d0', own.tone || 'gold']
    : BINDINGS[h % BINDINGS.length]
  const palette = { bg, ink, band, pages }
  const deco = own?.deco || STYLES[h2 % STYLES.length]
  const material =
    own?.material ||
    (deco === 'bands' ? 'leather' : deco === 'modern' ? 'paper' : tone === 'dark' ? 'paper' : 'cloth')

  const titleLine = fullSpineTitle(book)
  const len = titleLine.length
  // heights 168–224 like real trade/octavo/quarto volumes
  const height = 212 + (h2 % 57)
  const lines = len > 34 ? 3 : len > 17 ? 2 : 1
  const usable = height - 2 * 14 - 30 - (deco === 'bands' ? 30 : 0)
  const tSize = NARROW() ? 16 : SPINE_TITLE_SIZE
  const perLine = Math.floor(usable / (tSize * 0.52))
  let fitLines = Math.max(lines, Math.ceil(len / perLine))
  fitLines = Math.min(fitLines, 4)
  const width = NARROW()
    ? Math.max(32, Math.min(70, 10 + fitLines * 16 + (h % 3)))
    : Math.max(42, Math.min(84, 18 + fitLines * 19 + (h % 7)))
  let text = titleLine
  if (len > perLine * fitLines) text = shortenTitleLastResort(titleLine, perLine * fitLines)

  const texture = spineTextureUrl({ key: `${book.title}:${index}:v8`, material, bg, band })
  return { palette, material, height, width, fontSize: tSize, authorSize: NARROW() ? 11.5 : SPINE_AUTHOR_SIZE,
    inkMode: tone, deco, texture, pad: NARROW() ? 10 : 14, titleLine: text, lean: 0 }
}

/** Pack every catalog book, in order, into shelf rows that fit the case width. */
function buildShelfRows() {
  const inner = caseWidthPx() - (window.innerWidth >= 720 ? 72 : 44) - 14
  const rows = []
  let cur = []
  let used = 0
  for (const shelf of shelves) {
    shelf.books.forEach((book, index) => {
      const style = bookStyle(book, index)
      const w = style.width + 3
      if (used + w > inner && cur.length) {
        rows.push(cur)
        cur = []
        used = 0
      }
      cur.push({ shelf, book, index, style })
      used += w
    })
  }
  if (cur.length) rows.push(cur)
  // Fill each full shelf edge to edge like a real packed shelf
  rows.forEach((row, r) => {
    if (r === rows.length - 1) return
    const sum = row.reduce((a, b) => a + b.style.width + 3, 0)
    const add = Math.min(40, Math.floor((inner - sum) / row.length))
    if (add > 0) row.forEach((b) => { b.style.width += add })
  })
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
        <span class="discovery-mark" aria-hidden="true">
          <svg class="discovery-chevron" viewBox="0 0 16 16" width="14" height="14" focusable="false">
            <path d="M3.2 5.6 8 10.4l4.8-4.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
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

function renderShelfRow(row, i) {
  return `
    <section class="bay-section shelf-row" aria-label="Shelf ${i + 1}">
      <div class="bay-recess" style="--row-book-max: ${ROW_MAX_H}px">
        <div class="bay-back" aria-hidden="true"></div>
        <div class="bay-lamp" aria-hidden="true"></div>
        <div class="book-row" role="list" aria-label="Shelf ${i + 1}">
          ${row.map(({ shelf, book, index, style }) => renderBook(shelf, book, index, style)).join('')}
        </div>
        <div class="bay-ceiling-shadow" aria-hidden="true"></div>
      </div>
      <div class="shelf-board" aria-hidden="true">
        <div class="shelf-top-face"></div>
        <div class="shelf-front-lip"></div>
        <div class="shelf-under-shadow"></div>
      </div>
    </section>`
}

function renderBook(shelf, book, index, style) {
  const id = bookId(shelf.id, index)
  const selected = selectedId === id
  const authorLine = spineAuthor(book.author)
  return `
    <button
      type="button"
      class="book material-${style.material} ink-${style.inkMode} deco-${style.deco}${selected ? ' is-selected' : ''}"
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
        --spine-size: ${style.fontSize}px;
        --spine-author-size: ${style.authorSize}px;
        --spine-pad: ${style.pad}px;
        --spine-texture: url('${style.texture}');
      "
    >
      <span class="book-block">
        <span class="book-spine">
          <span class="spine-skin" aria-hidden="true"></span>
          <span class="spine-edge-light" aria-hidden="true"></span>
          <span class="spine-wear" aria-hidden="true"></span>
          <span class="spine-deco" aria-hidden="true"></span>
          <span class="spine-copy">
            <span class="spine-title">${escapeHtml(style.titleLine)}</span>
            <span class="spine-author">${escapeHtml(authorLine)}</span>
          </span>
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

function renderRecoRow(container, items) {
  if (!items?.length) {
    container.innerHTML = ''
    return false
  }
  container.innerHTML = items
    .map((item) => {
      const cover = item.cover
        ? `<img class="reco-cover" src="${escapeAttr(assetUrl(item.cover))}" alt="" loading="lazy" />`
        : `<span class="reco-cover reco-cover-fallback" aria-hidden="true"></span>`
      const action = item.bookId
        ? `type="button" class="reco-card is-linked" data-book-id="${escapeAttr(item.bookId)}"`
        : `type="button" class="reco-card" disabled`
      return `
        <button ${action}>
          ${cover}
          <span class="reco-meta">
            <span class="reco-title">${escapeHtml(item.title)}</span>
            <span class="reco-author">${escapeHtml(item.author || '')}</span>
          </span>
        </button>`
    })
    .join('')
  return true
}

function openPanel(id) {
  const found = findBook(id)
  if (!found) return
  selectedId = id
  const { shelf, book, index } = found
  const panel = document.getElementById('detail-panel')
  const backdrop = document.getElementById('panel-backdrop')
  const coverMeta = coverFor(shelf.id, index)
  const enrich = enrichmentFor(shelf.id, index)
  const coverWrap = document.getElementById('detail-cover-wrap')
  const coverImg = document.getElementById('detail-cover')
  const sourceEl = document.getElementById('detail-source')
  const photoWrap = document.getElementById('author-photo-wrap')
  const photoImg = document.getElementById('author-photo')

  document.getElementById('detail-category').textContent = shelf.category
  document.getElementById('detail-title').textContent = book.title
  document.getElementById('detail-author').textContent = book.author

  const longDesc = enrich?.longDescription || book.description
  document.getElementById('detail-description').innerHTML = longDesc
    .split(/\n\n+/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('')

  const authorName = enrich?.author?.name || book.author
  const authorBio =
    enrich?.author?.bio ||
    'Author profile unavailable for this edition; see the work description above.'
  document.getElementById('author-card-name').textContent = authorName
  document.getElementById('author-card-bio').textContent = authorBio

  if (enrich?.author?.photo) {
    photoImg.src = assetUrl(enrich.author.photo)
    photoImg.alt = `Portrait of ${authorName}`
    photoWrap.hidden = false
  } else {
    photoWrap.hidden = true
    photoImg.removeAttribute('src')
  }

  const similarOk = renderRecoRow(
    document.getElementById('similar-row'),
    enrich?.similar || [],
  )
  document.getElementById('similar-section').hidden = !similarOk

  const otherOk = renderRecoRow(
    document.getElementById('other-row'),
    enrich?.otherByAuthor || [],
  )
  document.getElementById('other-section').hidden = !otherOk

  if (coverMeta?.cover) {
    coverImg.src = assetUrl(coverMeta.cover)
    coverImg.alt = `Cover of ${book.title}`
    coverWrap.hidden = false
  } else {
    coverWrap.hidden = true
    coverImg.removeAttribute('src')
  }

  const credits = []
  if (coverMeta?.source) credits.push(`Cover: ${coverMeta.source}`)
  if (coverMeta?.note) credits.push(coverMeta.note)
  if (enrich?.author?.photo) credits.push('Author photo: Open Library / Wikipedia')
  if (credits.length) {
    sourceEl.hidden = false
    sourceEl.textContent = credits.join(' · ')
  } else if (!coverMeta?.cover) {
    sourceEl.hidden = false
    sourceEl.textContent = 'Cover image not found in Open Library for this edition yet.'
  } else {
    sourceEl.hidden = true
  }

  panel.hidden = false
  backdrop.hidden = false
  panel.scrollTop = 0
  requestAnimationFrame(() => {
    panel.classList.add('is-open')
    backdrop.classList.add('is-open')
  })

  document.querySelectorAll('.book, .cover-card').forEach((el) => {
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
  }, 340)

  document.querySelectorAll('.book, .cover-card').forEach((el) => {
    el.classList.remove('is-selected')
    el.setAttribute('aria-pressed', 'false')
  })

  if (prev) {
    document
      .querySelector(`.book[data-book-id="${prev}"], .cover-card[data-book-id="${prev}"]`)
      ?.focus()
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
    }, 360)
  }
}

function setView(view) {
  if (!['shelf', 'covers', 'authors'].includes(view)) return
  if (activeView === view) return
  if (selectedId) closePanel()
  activeView = view
  renderApp()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function bindEvents() {
  document.querySelector('.view-tabs')?.addEventListener('click', (event) => {
    const tab = event.target.closest('.view-tab')
    if (!tab) return
    setView(tab.dataset.view)
  })

  document.getElementById('room')?.addEventListener('click', (event) => {
    const btn = event.target.closest('.book')
    if (!btn) return
    openPanel(btn.dataset.bookId)
  })

  document.getElementById('authors-view')?.addEventListener('click', (event) => {
    const toggle = event.target.closest('.discovery-toggle')
    if (toggle) {
      setDiscoveryOpen(toggle.closest('.discovery-panel'), toggle.getAttribute('aria-expanded') !== 'true')
      return
    }
    const link = event.target.closest('.cluster-link')
    if (link) openPanel(link.dataset.bookId)
  })

  document.getElementById('covers-view')?.addEventListener('click', (event) => {
    const card = event.target.closest('.cover-card')
    if (!card) return
    openPanel(card.dataset.bookId)
  })

  const discovery = document.querySelector('.discovery')
  discovery?.addEventListener('click', (event) => {
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

  document.getElementById('detail-panel').addEventListener('click', (event) => {
    const card = event.target.closest('.reco-card.is-linked')
    if (!card) return
    openPanel(card.dataset.bookId)
    document
      .querySelector(`[data-book-id="${card.dataset.bookId}"].book`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })

  const room = document.getElementById('room')
  room?.addEventListener(
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
      const next = caseWidthPx()
      if (Math.abs(next - lastRowWidth) < 16) return
      const openId = selectedId
      renderApp()
      if (openId) openPanel(openId)
    }, 120)
  })
}

function renderApp() {
  applyWoodAssets()
  lastRowWidth = caseWidthPx()
  document.documentElement.style.setProperty('--case-width', `${lastRowWidth}px`)
  const app = document.querySelector('#app')
  // Preserve selected state across reflow by rebuilding markup below
  const html = buildAppHtml()
  app.innerHTML = html
  bindEvents()
  bindGlobalsOnce()
}

function renderCoversView() {
  return `
    <div class="covers-view" id="covers-view">
      ${shelves
        .map(
          (shelf) => `
        <section class="covers-section" aria-labelledby="covers-${shelf.id}">
          <div class="covers-heading">
            <h2 id="covers-${shelf.id}">${escapeHtml(shelf.label)}</h2>
            <p>${shelf.books.length}</p>
          </div>
          <div class="covers-grid" role="list" aria-label="${escapeAttr(shelf.label)} covers">
            ${shelf.books
              .map((book, index) => renderCoverCard(shelf, book, index))
              .join('')}
          </div>
        </section>`,
        )
        .join('')}
    </div>
  `
}

function renderCoverCard(shelf, book, index) {
  const id = bookId(shelf.id, index)
  const cover = coverFor(shelf.id, index)
  const hasCover = Boolean(cover?.cover)
  const selected = selectedId === id
  return `
    <button
      type="button"
      class="cover-card${hasCover ? '' : ' is-fallback'}${selected ? ' is-selected' : ''}"
      role="listitem"
      data-book-id="${id}"
      data-shelf="${shelf.id}"
      data-index="${index}"
      aria-label="${escapeAttr(book.title)} by ${escapeAttr(book.author)}"
      aria-pressed="${selected}"
    >
      ${
        hasCover
          ? `<img class="cover-card-img" src="${escapeAttr(assetUrl(cover.cover))}" alt="" loading="lazy" />`
          : `<span class="cover-card-fallback" aria-hidden="true">
              <span class="cover-card-fallback-title">${escapeHtml(book.title)}</span>
              <span class="cover-card-fallback-author">${escapeHtml(book.author)}</span>
            </span>`
      }
      <span class="cover-card-caption">
        <span class="cover-card-title">${escapeHtml(book.title)}</span>
        <span class="cover-card-author">${escapeHtml(book.author)}</span>
      </span>
    </button>
  `
}

const NON_PERSON = /^(author uncertain|various contributors|anthology|american standard version|american literature survey|farm and fireside)/i
const AUTHOR_ALIASES = { 'Carl G. Jung': 'C. G. Jung' }
const SURNAME_OVERRIDES = { 'Dante Alighieri': 'Dante' }
const VARIOUS = 'Anthologies & Various'

/** Split a catalog author string into normalised person names. */
function authorNames(raw) {
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

function surnameKey(name) {
  if (name === VARIOUS) return '\uffff'
  if (SURNAME_OVERRIDES[name]) return SURNAME_OVERRIDES[name]
  const parts = name.replace(/\s+Jr\.?$/i, '').split(/\s+/)
  return `${parts[parts.length - 1]} ${parts.slice(0, -1).join(' ')}`
}

function buildAuthorIndex() {
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
    .sort((x, y) => x.key.localeCompare(y.key, 'en', { sensitivity: 'base' }))
}

function renderAuthorsView() {
  return `
    <div class="covers-view authors-list" id="authors-view" style="display:flex;flex-direction:column;gap:0.55rem;max-width:640px">
      ${buildAuthorIndex()
        .map(
          (a, i) => `
        <div class="discovery-panel" data-author="${i}">
          <button type="button" class="discovery-toggle" id="author-toggle-${i}"
            aria-expanded="false" aria-controls="author-panel-${i}">
            <span class="discovery-label">
              <span class="discovery-title">${escapeHtml(a.name)} <span style="opacity:0.55">(${a.books.length})</span></span>
            </span>
            <span class="discovery-mark" aria-hidden="true">
              <svg class="discovery-chevron" viewBox="0 0 16 16" width="14" height="14" focusable="false">
                <path d="M3.2 5.6 8 10.4l4.8-4.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </button>
          <div class="discovery-body" id="author-panel-${i}" role="region" aria-labelledby="author-toggle-${i}" hidden>
            <ul class="cluster-titles">
              ${a.books
                .map(
                  ({ shelf, book, index }) => `<li>
                <button type="button" class="cluster-link" data-book-id="${escapeAttr(bookId(shelf.id, index))}">
                  <span class="cluster-link-title">${escapeHtml(book.title)}</span>
                </button>
              </li>`,
                )
                .join('')}
            </ul>
          </div>
        </div>`,
        )
        .join('')}
    </div>
  `
}

function buildAppHtml() {
  const shelfActive = activeView === 'shelf'
  return `
    <div class="atmosphere" aria-hidden="true">
      <div class="spot spot-a"></div>
      <div class="spot spot-b"></div>
      <div class="spot spot-c"></div>
      <div class="vignette"></div>
      <div class="grain"></div>
    </div>

    <header class="hero">
      <h1 class="brand">Library</h1>
    </header>

    <nav class="view-tabs" aria-label="Library views">
      ${[
        ['shelf', 'Bookshelf', 'room'],
        ['covers', 'Covers', 'covers-view'],
        ['authors', 'Authors', 'authors-view'],
      ]
        .map(
          ([view, label, controls]) => `<button
        type="button"
        class="view-tab${activeView === view ? ' is-active' : ''}"
        id="tab-${view}"
        data-view="${view}"
        aria-selected="${activeView === view}"
        aria-controls="${controls}"
      >${label}</button>`,
        )
        .join('')}
    </nav>

    ${
      shelfActive
        ? `<main class="room" id="room">
      <div class="bookcase bookcase--real" id="bookcase">
        <div class="case-crown" aria-hidden="true"></div>
        <div class="case-body">
          <div class="case-upright left" aria-hidden="true"></div>
          <div class="case-bays">
            ${buildShelfRows().map((row, i) => renderShelfRow(row, i)).join('')}
          </div>
          <div class="case-upright right" aria-hidden="true"></div>
        </div>
        <div class="case-plinth" aria-hidden="true"></div>
      </div>
    </main>`
        : activeView === 'authors'
          ? renderAuthorsView()
          : renderCoversView()
    }

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
      <span>${shelfActive ? 'Bookshelf' : activeView === 'authors' ? 'Authors' : 'Cover gallery'}</span>
      <span aria-hidden="true">·</span>
      <a href="${import.meta.env.BASE_URL}topics.html" style="color:inherit">Topic index</a>
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
      <div class="panel-chrome">
        <span class="panel-chrome-label">Shelf detail</span>
        <button type="button" class="panel-close" id="panel-close" aria-label="Close book details">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div class="detail-hero">
        <div class="detail-cover-wrap" id="detail-cover-wrap" hidden>
          <img class="detail-cover" id="detail-cover" alt="" />
        </div>
        <div class="detail-hero-text">
          <p class="detail-category" id="detail-category"></p>
          <h2 class="detail-title" id="detail-title"></h2>
          <p class="detail-author" id="detail-author"></p>
        </div>
      </div>
      <section class="detail-section">
        <h3 class="detail-section-label">About this book</h3>
        <div class="detail-description" id="detail-description"></div>
      </section>
      <section class="detail-section detail-author-block" id="detail-author-block">
        <h3 class="detail-section-label">About the author</h3>
        <div class="author-card">
          <div class="author-photo-wrap" id="author-photo-wrap" hidden>
            <img class="author-photo" id="author-photo" alt="" />
          </div>
          <div class="author-card-text">
            <p class="author-card-name" id="author-card-name"></p>
            <p class="author-card-bio" id="author-card-bio"></p>
          </div>
        </div>
      </section>
      <section class="detail-section" id="similar-section" hidden>
        <h3 class="detail-section-label">Similar books</h3>
        <div class="reco-row" id="similar-row"></div>
      </section>
      <section class="detail-section" id="other-section" hidden>
        <h3 class="detail-section-label">Other books by this author</h3>
        <div class="reco-row" id="other-row"></div>
      </section>
      <p class="detail-source" id="detail-source" hidden></p>
    </aside>
  `
}

renderApp()
