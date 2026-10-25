import MiniSearch from 'minisearch'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force'
import { shelves } from './catalog.js'
import { coverFor } from './covers-data.js'
import { enrichmentFor } from './enrichments.js'
import { authorNames, VARIOUS } from './authors.js'
import { TOPICS } from './data/topics-data.js'
import { AUTHOR_DATES, WORK_YEARS } from './data/timeline-data.js'
import { READING_PATHS, INFLUENCES } from './data/paths-data.js'

const esc = (s) =>
  String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
const asset = (rel) => `${import.meta.env.BASE_URL || '/'}${rel.replace(/^\//, '')}`

/** Flat catalog: id -> { id, shelf, book, index } */
const ALL = []
const BY_ID = new Map()
for (const shelf of shelves) shelf.books.forEach((book, index) => {
  const e = { id: `${shelf.id}-${index}`, shelf, book, index }
  ALL.push(e)
  BY_ID.set(e.id, e)
})
const TOPICS_BY_BOOK = new Map()
for (const [topic, rows] of Object.entries(TOPICS)) for (const [id, s] of rows) {
  if (!TOPICS_BY_BOOK.has(id)) TOPICS_BY_BOOK.set(id, [])
  TOPICS_BY_BOOK.get(id).push([topic, s])
}

const fmtYear = (y, approx) => (y == null ? '' : `${approx ? 'c. ' : ''}${y < 0 ? `${-y} BCE` : y}`)

function bookChip(id, extra = '') {
  const e = BY_ID.get(id)
  if (!e) return ''
  const c = coverFor(e.shelf.id, e.index)
  const img = c?.cover
    ? `<img src="${esc(asset(c.cover))}" alt="" loading="lazy" />`
    : `<span class="chip-fallback" aria-hidden="true"></span>`
  return `<button type="button" class="book-chip" data-book-id="${esc(id)}">${img}<span class="chip-text"><span class="chip-title">${esc(e.book.title)}</span>${extra ? `<span class="chip-sub">${extra}</span>` : ''}</span></button>`
}

/* ───────── Timeline ───────── */
export function renderTimelineView() {
  const byAuthor = new Map()
  const undated = []
  for (const e of ALL) {
    const names = authorNames(e.book.author).filter((n) => n !== VARIOUS)
    const dated = names.find((n) => AUTHOR_DATES[n])
    if (!dated) { undated.push(e); continue }
    if (!byAuthor.has(dated)) byAuthor.set(dated, [])
    byAuthor.get(dated).push(e)
  }
  const rows = [...byAuthor.entries()]
    .map(([name, books]) => ({ name, d: AUTHOR_DATES[name], books }))
    .sort((a, b) => a.d.born - b.d.born)
  const eras = [
    [-Infinity, 500, 'Antiquity'], [500, 1450, 'Middle Ages'], [1450, 1650, 'Renaissance & Reformation'],
    [1650, 1800, 'Enlightenment'], [1800, 1900, 'Nineteenth century'], [1900, 1950, 'Early twentieth century'],
    [1950, Infinity, 'Since 1950'],
  ]
  let html = ''
  for (const [lo, hi, label] of eras) {
    const inEra = rows.filter((r) => r.d.born + 25 >= lo && r.d.born + 25 < hi)
    if (!inEra.length) continue
    html += `<section class="tl-era"><h2 class="view-h2">${label}</h2><ol class="tl-list">`
    for (const r of inEra) {
      const life = `${fmtYear(r.d.born, r.d.approx)} – ${r.d.died == null ? 'living' : fmtYear(r.d.died, r.d.approx)}`
      html += `<li class="tl-item"><div class="tl-dot" aria-hidden="true"></div><div class="tl-body">
        <p class="tl-name">${esc(r.name)} <span class="tl-life">${life}</span>${r.d.note ? ` <span class="tl-flag" title="${esc(r.d.note)}">?</span>` : ''}</p>
        <div class="chip-row">${r.books
          .map((e) => {
            const w = WORK_YEARS[e.id]
            return bookChip(e.id, w ? `${fmtYear(w.year, w.approx)}${w.note ? ' *' : ''}` : '')
          })
          .join('')}</div></div></li>`
    }
    html += `</ol></section>`
  }
  return `<div class="view-wrap" id="timeline-view">
    <p class="view-lede">Authors placed by lifespan, ancient to modern; years under a title give the work’s original publication or composition. <em>c.</em> marks circa or traditional dates.</p>
    ${html}
    <section class="tl-era"><h2 class="view-h2">Undated</h2><p class="view-note">Anthologies, multi-author volumes and authors whose dates couldn’t be confirmed.</p>
    <div class="chip-row">${undated.map((e) => bookChip(e.id, esc(e.book.author))).join('')}</div></section>
  </div>`
}

/* ───────── Reading paths ───────── */
export function renderPathsView() {
  return `<div class="view-wrap" id="paths-view">
    <p class="view-lede">Curated routes through books already on these shelves, with a reason for every step.</p>
    ${READING_PATHS.map(
      (p) => `<section class="path"><h2 class="view-h2">${esc(p.title)}</h2><p class="view-note">${esc(p.blurb)}</p>
      <ol class="path-steps">${p.steps
        .filter(([id]) => BY_ID.has(id))
        .map(([id, why], i) => {
          const e = BY_ID.get(id)
          return `<li class="path-step"><span class="path-num">${i + 1}</span>
            <button type="button" class="path-link" data-book-id="${esc(id)}"><span class="path-title">${esc(e.book.title)}</span><span class="path-author">${esc(authorNames(e.book.author)[0])}</span></button>
            <p class="path-why">${esc(why)}</p></li>`
        })
        .join('')}</ol></section>`,
    ).join('')}
  </div>`
}

/* ───────── Ask your library (static BM25 search) ───────── */
const STOP = new Set('what which who whom does do did my the a an of on in about say says said books book is are was were to and or for with how why me i any have has that this there their it as by from tell show find'.split(' '))
const SYN = {
  god: ['divine', 'theology', 'holy', 'sacred'], death: ['mortality', 'dying'], love: ['eros', 'desire'],
  state: ['politics', 'political', 'government'], power: ['politics', 'domination'], mind: ['consciousness', 'soul'],
  justice: ['just', 'law', 'injustice'], science: ['scientific', 'nature'], art: ['aesthetic', 'beauty'],
  freedom: ['liberty', 'free'], technology: ['technique', 'machine', 'media'], myth: ['mythology', 'hero'],
  history: ['historical', 'civilization'], time: ['eternity', 'temporality'], evil: ['sin', 'fall'],
}
let mini = null
function index() {
  if (mini) return mini
  mini = new MiniSearch({
    fields: ['title', 'author', 'topics', 'notes', 'text'],
    storeFields: ['kind', 'ref'],
    searchOptions: { boost: { title: 3, topics: 3, author: 2, notes: 1.5 }, prefix: (t) => t.length > 3, fuzzy: 0.2 },
  })
  const docs = ALL.map((e) => {
    const t = TOPICS_BY_BOOK.get(e.id) || []
    const en = enrichmentFor(e.shelf.id, e.index)
    return {
      id: `b:${e.id}`, kind: 'book', ref: e.id, title: e.book.title, author: e.book.author,
      topics: t.map((x) => x[0]).join(' '), notes: t.map((x) => x[1]).join(' '),
      text: `${e.book.description || ''} ${en?.longDescription || ''} ${e.shelf.label}`,
    }
  })
  for (const [topic, rows] of Object.entries(TOPICS))
    docs.push({ id: `t:${topic}`, kind: 'topic', ref: topic, title: topic, author: '', topics: topic, notes: rows.map((r) => r[1]).join(' '), text: '' })
  mini.addAll(docs)
  return mini
}
export function askLibrary(q) {
  const words = q.toLowerCase().replace(/[^\p{L}\p{N}\s'-]/gu, ' ').split(/\s+/).filter((w) => w && !STOP.has(w))
  if (!words.length) return { words, topics: [], books: [] }
  const expanded = [...new Set(words.flatMap((w) => [w, ...(SYN[w] || [])]))]
  const res = index().search(expanded.join(' '), { combineWith: 'OR' })
  const topics = res.filter((r) => r.kind === 'topic').slice(0, 4).map((r) => r.ref)
  const books = res.filter((r) => r.kind === 'book').slice(0, 12).map((r) => {
    const hit = (TOPICS_BY_BOOK.get(r.ref) || []).find(([t, s]) => words.some((w) => (t + ' ' + s).toLowerCase().includes(w)))
    return { id: r.ref, note: hit ? hit[1] : '', topic: hit ? hit[0] : '' }
  })
  return { words, topics, books }
}
export function renderAskView(q = '') {
  const r = q ? askLibrary(q) : null
  const examples = ['What do my books say about justice?', 'the sacred and the holy', 'technology and media', 'myth and the hero', 'time and eternity']
  let body = ''
  if (!r) {
    body = `<p class="view-note">Try: ${examples.map((x) => `<button type="button" class="ask-example" data-q="${esc(x)}">${esc(x)}</button>`).join(' ')}</p>`
  } else if (!r.books.length && !r.topics.length) {
    body = `<p class="view-note">Nothing in the library matched “${esc(q)}”. Try a single key word such as <em>justice</em> or <em>God</em>.</p>`
  } else {
    body += r.topics.length
      ? `<section class="ask-topics"><h2 class="view-h2">Topics</h2>${r.topics
          .map((t) => `<details class="ask-topic"><summary>${esc(t)} <span class="count">(${TOPICS[t].length})</span></summary><ul>${TOPICS[t]
            .map(([id, s]) => (BY_ID.has(id) ? `<li><button type="button" class="path-link" data-book-id="${esc(id)}"><span class="path-title">${esc(BY_ID.get(id).book.title)}</span></button><p class="path-why">${esc(s)}</p></li>` : ''))
            .join('')}</ul></details>`)
          .join('')}</section>`
      : ''
    body += `<section><h2 class="view-h2">Books</h2><ol class="ask-results">${r.books
      .map(({ id, note, topic }) => {
        const e = BY_ID.get(id)
        return `<li>${bookChip(id, esc(authorNames(e.book.author)[0]))}${note ? `<p class="path-why"><strong>${esc(topic)}:</strong> ${esc(note)}</p>` : `<p class="path-why">${esc((e.book.description || '').split('. ')[0])}.</p>`}</li>`
      })
      .join('')}</ol></section>`
  }
  return `<div class="view-wrap" id="ask-view">
    <form class="ask-form" id="ask-form" role="search">
      <input id="ask-input" type="search" name="q" value="${esc(q)}" placeholder="Ask your library — e.g. what do my books say about justice?" autocomplete="off" aria-label="Ask your library" />
      <button type="submit" class="ask-go">Ask</button>
    </form>
    <p class="view-note small">Searches titles, authors, descriptions and the topic index — entirely in your browser.</p>
    <div id="ask-results">${body}</div>
  </div>`
}

/* ───────── Idea map ───────── */
export function renderMapView() {
  return `<div class="view-wrap wide" id="map-view">
    <p class="view-lede">Authors (dots) linked to the topics (rings) their books address, plus documented influences (gold). Drag to pan, scroll or pinch to zoom, tap a node to explore.</p>
    <div class="map-frame"><svg id="idea-map" role="img" aria-label="Idea map of authors and topics"></svg>
      <div class="map-legend"><span><i class="lg-author"></i>Author</span><span><i class="lg-topic"></i>Topic</span><span><i class="lg-infl"></i>Influence</span></div>
      <div class="map-info" id="map-info" hidden></div></div>
  </div>`
}

export function mountIdeaMap(openPanel) {
  const svg = document.getElementById('idea-map')
  if (!svg) return
  const W = svg.clientWidth || 900
  const H = svg.clientHeight || 640
  const nodes = new Map()
  const links = []
  const node = (id, o) => { if (!nodes.has(id)) nodes.set(id, { id, ...o, deg: 0 }); return nodes.get(id) }
  const authorBooks = new Map()
  for (const [topic, rows] of Object.entries(TOPICS)) {
    node(`t:${topic}`, { kind: 'topic', label: topic })
    for (const [id] of rows) {
      const e = BY_ID.get(id); if (!e) continue
      const a = authorNames(e.book.author)[0]; if (a === VARIOUS) continue
      node(`a:${a}`, { kind: 'author', label: a })
      if (!authorBooks.has(a)) authorBooks.set(a, new Set())
      authorBooks.get(a).add(id)
      if (!links.some((l) => l.source === `a:${a}` && l.target === `t:${topic}`)) links.push({ source: `a:${a}`, target: `t:${topic}`, kind: 'topic' })
    }
  }
  for (const [x, y] of INFLUENCES) if (nodes.has(`a:${x}`) && nodes.has(`a:${y}`)) links.push({ source: `a:${x}`, target: `a:${y}`, kind: 'infl' })
  for (const l of links) { nodes.get(l.source).deg++; nodes.get(l.target).deg++ }
  const N = [...nodes.values()]
  const NS = 'http://www.w3.org/2000/svg'
  const mk = (tag, attrs, parent) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); parent?.appendChild(el); return el }
  svg.innerHTML = ''
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
  const g = mk('g', {}, svg)
  const gl = mk('g', { class: 'm-links' }, g)
  const gn = mk('g', { class: 'm-nodes' }, g)
  const lEls = links.map((l) => mk('line', { class: `m-link ${l.kind}` }, gl))
  const nEls = N.map((n) => {
    const grp = mk('g', { class: `m-node ${n.kind}`, tabindex: 0, role: 'button', 'aria-label': n.label }, gn)
    n.r = n.kind === 'topic' ? 5 + Math.sqrt(n.deg) * 2.2 : 3.5 + Math.sqrt(n.deg) * 1.2
    mk('circle', { r: n.r }, grp)
    const t = mk('text', { dy: -n.r - 4 }, grp); t.textContent = n.label
    grp.addEventListener('click', (ev) => { ev.stopPropagation(); select(n) })
    grp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') select(n) })
    return grp
  })
  const sim = forceSimulation(N)
    .force('link', forceLink(links).id((d) => d.id).distance((l) => (l.kind === 'infl' ? 40 : 55)).strength(0.4))
    .force('charge', forceManyBody().strength(-70).distanceMax(260))
    .force('x', forceX(W / 2).strength(0.07))
    .force('y', forceY(H / 2).strength(0.07 * (W / H)))
    .force('center', forceCenter(W / 2, H / 2))
    .force('collide', forceCollide().radius((d) => d.r + 6))
    .stop()
  for (let i = 0; i < 320; i++) sim.tick()
  const draw = () => {
    links.forEach((l, i) => { const e = lEls[i]; e.setAttribute('x1', l.source.x); e.setAttribute('y1', l.source.y); e.setAttribute('x2', l.target.x); e.setAttribute('y2', l.target.y) })
    N.forEach((n, i) => nEls[i].setAttribute('transform', `translate(${n.x},${n.y})`))
  }
  draw()
  // fit
  const xs = N.map((n) => n.x), ys = N.map((n) => n.y)
  const minX = Math.min(...xs) - 40, maxX = Math.max(...xs) + 40, minY = Math.min(...ys) - 40, maxY = Math.max(...ys) + 40
  let k = Math.min(W / (maxX - minX), H / (maxY - minY)), tx = -minX * k + (W - (maxX - minX) * k) / 2, ty = -minY * k + (H - (maxY - minY) * k) / 2
  const k0 = k
  const apply = () => { g.setAttribute('transform', `translate(${tx},${ty}) scale(${k})`); svg.classList.toggle('zoomed', k > k0 * 1.7) }
  apply()
  // pan / zoom (pointer + wheel + pinch)
  const pts = new Map(); let last = null; let pinch = null; let moved = 0
  const toSvg = (cx, cy) => { const r = svg.getBoundingClientRect(); return [((cx - r.left) / r.width) * W, ((cy - r.top) / r.height) * H] }
  const zoomAt = (px, py, f) => { const nk = Math.max(0.3, Math.min(6, k * f)); tx = px - ((px - tx) * nk) / k; ty = py - ((py - ty) * nk) / k; k = nk; apply() }
  svg.addEventListener('wheel', (e) => { e.preventDefault(); const [px, py] = toSvg(e.clientX, e.clientY); zoomAt(px, py, Math.exp(-e.deltaY * 0.0015)) }, { passive: false })
  svg.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, [e.clientX, e.clientY]); last = [e.clientX, e.clientY]; moved = 0 })
  svg.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return
    pts.set(e.pointerId, [e.clientX, e.clientY])
    if (pts.size === 2) {
      const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); const [px, py] = toSvg((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
      if (pinch) zoomAt(px, py, d / pinch); pinch = d; return
    }
    const r = svg.getBoundingClientRect(); const dx = ((e.clientX - last[0]) / r.width) * W, dy = ((e.clientY - last[1]) / r.height) * H
    moved += Math.abs(dx) + Math.abs(dy); if (moved > 4) { tx += dx; ty += dy; apply() }
    last = [e.clientX, e.clientY]
  })
  const end = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null }
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end)
  svg.addEventListener('click', () => { if (moved < 5) select(null) })
  const info = document.getElementById('map-info')
  function select(n) {
    if (moved > 5) return
    const nb = new Set()
    if (n) links.forEach((l) => { if (l.source === n) nb.add(l.target); if (l.target === n) nb.add(l.source) })
    N.forEach((m, i) => nEls[i].classList.toggle('dim', !!n && m !== n && !nb.has(m)))
    N.forEach((m, i) => nEls[i].classList.toggle('on', m === n))
    links.forEach((l, i) => lEls[i].classList.toggle('hl', !!n && (l.source === n || l.target === n)))
    svg.classList.toggle('has-sel', !!n)
    if (!n) { info.hidden = true; return }
    let ids = []
    if (n.kind === 'author') ids = [...(authorBooks.get(n.label) || [])]
    else ids = TOPICS[n.label].map((r) => r[0])
    const infl = n.kind === 'author'
      ? links.filter((l) => l.kind === 'infl' && (l.source === n || l.target === n)).map((l) => (l.source === n ? `→ ${l.target.label}` : `← ${l.source.label}`))
      : []
    info.innerHTML = `<p class="mi-kind">${n.kind === 'author' ? 'Author' : 'Topic'}</p><h3>${esc(n.label)}</h3>${infl.length ? `<p class="mi-infl">${esc(infl.join(' · '))}</p>` : ''}<ul>${ids
      .filter((id) => BY_ID.has(id))
      .map((id) => `<li><button type="button" class="path-link" data-book-id="${esc(id)}"><span class="path-title">${esc(BY_ID.get(id).book.title)}</span></button></li>`)
      .join('')}</ul>`
    info.hidden = false
  }
  info.addEventListener('click', (e) => { const b = e.target.closest('[data-book-id]'); if (b) openPanel(b.dataset.bookId) })
}
