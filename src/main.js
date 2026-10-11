import './style.css'
import { shelves, countBooks } from './catalog.js'
import { relatedClusters, worthExploring } from './discoveries.js'
import { spineTextureUrl, hashString } from './textures.js'
import { coverFor } from './covers-data.js'
import { enrichmentFor } from './enrichments.js'

const MATERIALS = ['leather', 'cloth', 'paper', 'board']
/* Spine ink is always light (cream / soft gold) for contrast on dark bindings */
const PALETTES = [
  { bg: '#2a1814', ink: '#f0e6d0', band: '#c4a35a', pages: '#e8e0d0' },
  { bg: '#1a2420', ink: '#ebe6d4', band: '#8a9a7a', pages: '#e6e2d6' },
  { bg: '#1c1410', ink: '#f5ecd8', band: '#a67c52', pages: '#efe6d4' },
  { bg: '#121820', ink: '#e8e4d4', band: '#6a8aaa', pages: '#e4e6ea' },
  { bg: '#3a1414', ink: '#f2e4c8', band: '#c4a35a', pages: '#ebe4d4' },
  { bg: '#1a1612', ink: '#efe6d2', band: '#8a7040', pages: '#e8e2d4' },
  { bg: '#101818', ink: '#ebe8d8', band: '#5a8a7a', pages: '#e2e6e0' },
  { bg: '#2c2010', ink: '#f7efd4', band: '#d4af37', pages: '#efe6d0' },
  { bg: '#18101a', ink: '#f0e6dc', band: '#9a6a7a', pages: '#e8e0e4' },
  { bg: '#221c14', ink: '#f2ebd6', band: '#9a8a50', pages: '#ebe4d6' },
  { bg: '#0e1814', ink: '#e8ecd8', band: '#4a7a5a', pages: '#e0e6e0' },
  { bg: '#2a2218', ink: '#f5eedc', band: '#b09050', pages: '#efe8d8' },
  { bg: '#141010', ink: '#efe6d8', band: '#7a5a4a', pages: '#e8e2d8' },
  { bg: '#101420', ink: '#eae6da', band: '#5a6a9a', pages: '#e2e4ea' },
  { bg: '#241c14', ink: '#f4ecd4', band: '#a88848', pages: '#ebe4d4' },
]

let selectedId = null
let lastRowWidth = 0
let activeView = 'covers' // 'shelf' | 'covers'

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

/** Full title for the spine — keep wording; strip only edition/series noise */
function fullSpineTitle(book) {
  let t = (book.title || '').replace(/\s+/g, ' ').trim()
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

function bookStyle(book, index) {
  const h = hashString(`${book.title}:${book.author}:${index}`)
  const palette = PALETTES[h % PALETTES.length]
  const material = MATERIALS[h % MATERIALS.length]

  // Larger cream/gold lettering inside the same realistic spine footprint
  let titleLine = fullSpineTitle(book)
  const minH = 148
  const maxH = 176
  const minW = 28
  const maxW = 40

  // Bigger stamp; fit by wrap + tight leading, not by growing slabs
  let fontSize = titleLine.length > 36 ? 11 : titleLine.length > 24 ? 12 : 13
  let authorSize = Math.max(9, Math.round(fontSize * 0.78 * 10) / 10)
  let pad = 10

  const capacityOf = (w, ht, fs, as, pd) => {
    const cols = w >= 36 ? 3 : w >= 30 ? 2 : 1
    const usable = ht - pd * 2 - (as * 1.15 + 5)
    const per = Math.max(5, Math.floor(usable / (fs * 1.0)))
    return { cols, capacity: cols * per }
  }

  // Keep prior realistic spine sizes
  let height = Math.min(maxH, Math.max(minH, 154 + (h % 18)))
  let width = Math.min(maxW, Math.max(minW, 30 + (h % 9)))

  let { capacity } = capacityOf(width, height, fontSize, authorSize, pad)
  if (titleLine.length > capacity) {
    // Nudge to max footprint within the same slab budget, then slightly reduce type
    height = maxH
    width = Math.min(maxW, Math.max(width, 34))
    pad = 9
    ;({ capacity } = capacityOf(width, height, fontSize, authorSize, pad))
  }
  if (titleLine.length > capacity) {
    fontSize = Math.max(10.5, fontSize - 1)
    authorSize = Math.max(8.5, Math.round(fontSize * 0.78 * 10) / 10)
    width = maxW
    ;({ capacity } = capacityOf(width, height, fontSize, authorSize, pad))
  }
  if (titleLine.length > capacity) {
    fontSize = 10.5
    authorSize = 8.5
    ;({ capacity } = capacityOf(width, height, fontSize, authorSize, pad))
    if (titleLine.length > capacity) {
      titleLine = shortenTitleLastResort(titleLine, capacity)
    }
  }

  const inkMode = h % 2 === 0 ? 'foil' : 'ink'
  const texture = spineTextureUrl({
    key: `${book.title}:${index}:v6`,
    material,
    bg: palette.bg,
    band: palette.band,
  })
  return {
    palette,
    material,
    height,
    width,
    fontSize,
    authorSize,
    inkMode,
    texture,
    pad,
    titleLine,
  }
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
        .map((row, rowIndex) => {
          const rowMax = Math.max(...row.map(({ style }) => style.height), 148)
          return `
        <div class="bay-recess" data-row="${rowIndex}" style="--row-book-max: ${rowMax}px">
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
        </div>`
        })
        .join('')}
    </section>
  `
}

function renderBook(shelf, book, index, style) {
  const id = bookId(shelf.id, index)
  const selected = selectedId === id
  const authorLine = spineAuthor(book.author)
  return `
    <button
      type="button"
      class="book material-${style.material} ink-${style.inkMode}${selected ? ' is-selected' : ''}"
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
  }, 280)

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
    }, 280)
  }
}

function setView(view) {
  if (view !== 'shelf' && view !== 'covers') return
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

  // Room-scoped light for the bookcase; page-wide tracking lives in bindGlobalsOnce
  document.getElementById('room')?.addEventListener(
    'pointermove',
    (event) => {
      const room = event.currentTarget
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

  // Cool study lamp follows the pointer across the whole page (Covers + Bookshelf)
  document.addEventListener(
    'pointermove',
    (event) => {
      const x = (event.clientX / window.innerWidth) * 100
      const y = (event.clientY / window.innerHeight) * 100
      document.documentElement.style.setProperty('--light-x', `${x}%`)
      document.documentElement.style.setProperty('--light-y', `${Math.min(42, Math.max(8, y * 0.45))}%`)
    },
    { passive: true },
  )

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

function buildAppHtml() {
  const shelfActive = activeView === 'shelf'
  return `
    <div class="atmosphere" aria-hidden="true">
      <div class="haze"></div>
      <div class="shaft"></div>
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
      <button
        type="button"
        class="view-tab${!shelfActive ? ' is-active' : ''}"
        id="tab-covers"
        data-view="covers"
        aria-selected="${!shelfActive}"
        aria-controls="covers-view"
      >Covers</button>
      <button
        type="button"
        class="view-tab${shelfActive ? ' is-active' : ''}"
        id="tab-shelf"
        data-view="shelf"
        aria-selected="${shelfActive}"
        aria-controls="room"
      >Bookshelf</button>
    </nav>

    ${
      shelfActive
        ? `<main class="room" id="room">
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
    </main>`
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
      <span>${shelfActive ? 'Bookshelf' : 'Cover gallery'}</span>
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
