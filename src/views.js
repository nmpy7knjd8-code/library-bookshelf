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
const THEMES = [
  ['Philosophy', '#9fb4d6', ['Being and Ontology', 'Consciousness and Mind', 'Ethics and Virtue', 'Existence and Authenticity', 'Knowledge and Reason', 'Language and Meaning', 'Phenomenology', 'The Absolute and Spirit', 'Time and Eternity', 'Aesthetics and Art', 'Death and Mortality', 'Love']],
  ['History', '#d39a6a', ['American History and Founding', 'Ancient Greece and Rome', 'Biography and Character', 'Carlyle', 'China', 'Civilization, Rise and Decline', 'French Revolution and Napoleon', 'Heroes and Great Men', 'Philosophy of History', 'Prussia and Germany', 'Renaissance and Humanism', 'Travel']],
  ['Literature', '#b99ae0', ['Faust and the Demonic Pact', 'Literary Criticism', 'Milton', 'Myth and Symbol', 'Poetry and Poetics', 'Satire', 'Shakespeare', 'The Novel and Modern Fiction', 'Tragedy', 'Transcendentalism and Romanticism', 'Nature']],
  ['Religion', '#7cc6b4', ['Christianity and the Church', 'God and the Divine', 'Mysticism', 'Sin, Evil and the Fall', 'The Sacred and the Holy']],
  ['Science', '#93c983', ['Science and Religion', 'Science and the Scientific Revolution', 'Technology and Media', 'Psychology and the Unconscious', 'Education']],
  ['Politics', '#dd8a8f', ['American Culture and Society', 'Authority, Tradition and Counter-Revolution', 'Communism and Marxism', 'Critique of Modernity', 'Enlightenment', 'Freedom and Liberty', 'Justice', 'Political Philosophy and the State', 'Revolution', 'Self-Reliance and Individualism', 'Utopia and the Ideal Society']],
]
const THEME_OF = new Map()
THEMES.forEach(([, , ts], i) => ts.forEach((t) => THEME_OF.set(t, i)))

export function renderMapView() {
  return `<div class="view-wrap wide" id="map-view">
    <p class="view-lede">Topics (rings) grouped into six broad themes, with the authors (dots) whose books address them and documented influences (gold). Drag to pan, pinch or scroll to zoom, tap anything to explore.</p>
    <div class="map-themes" role="group" aria-label="Jump to a theme">
      ${THEMES.map(([name, col], i) => `<button type="button" class="map-theme" data-theme="${i}" style="--c:${col}"><i></i>${name}</button>`).join('')}
      <button type="button" class="map-theme map-reset" data-theme="all">Show all</button>
    </div>
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
  // the layout lives on a large fixed virtual canvas; the viewport just pans/zooms over it
  // portrait screens get a 2×3 grid of theme clusters, landscape a 3×2 grid
  const cols = W / H > 1.1 ? 3 : 2, rows = THEMES.length / cols
  const CELL = 470
  const VW = cols * CELL, VH = rows * CELL
  const nodes = new Map()
  const links = []
  const node = (id, o) => { if (!nodes.has(id)) nodes.set(id, { id, ...o, deg: 0 }); return nodes.get(id) }
  const authorBooks = new Map()
  const authorThemes = new Map()
  for (const [topic, rows] of Object.entries(TOPICS)) {
    const th = THEME_OF.get(topic) ?? 0
    node(`t:${topic}`, { kind: 'topic', label: topic, theme: th })
    for (const [id] of rows) {
      const e = BY_ID.get(id); if (!e) continue
      const a = authorNames(e.book.author)[0]; if (a === VARIOUS) continue
      node(`a:${a}`, { kind: 'author', label: a })
      if (!authorBooks.has(a)) authorBooks.set(a, new Set())
      authorBooks.get(a).add(id)
      const c = authorThemes.get(a) || new Array(THEMES.length).fill(0); c[th]++; authorThemes.set(a, c)
      if (!links.some((l) => l.source === `a:${a}` && l.target === `t:${topic}`)) links.push({ source: `a:${a}`, target: `t:${topic}`, kind: 'topic' })
    }
  }
  for (const [a, c] of authorThemes) { const n = nodes.get(`a:${a}`); n.theme = c.indexOf(Math.max(...c)); const tot = c.reduce((x, y) => x + y, 0); n.mix = c.map((v) => v / tot) }
  for (const [x, y] of INFLUENCES) if (nodes.has(`a:${x}`) && nodes.has(`a:${y}`)) links.push({ source: `a:${x}`, target: `a:${y}`, kind: 'infl' })
  for (const l of links) { nodes.get(l.source).deg++; nodes.get(l.target).deg++ }
  const N = [...nodes.values()]
  // theme anchors on an ellipse
  // order keeps related themes adjacent: Philosophy·History·Politics / Religion·Literature·Science
  const ORDER = cols === 3 ? [0, 1, 5, 3, 2, 4] : [0, 1, 3, 5, 2, 4]
  const anchors = []
  ORDER.forEach((th, slot) => { anchors[th] = [((slot % cols) + 0.5) * CELL, (Math.floor(slot / cols) + 0.5) * CELL] })
  // light blend: authors stay anchored to their primary theme but lean BLEND of the way
  // toward the other themes they write about, weighted by topic share
  const BLEND = 0.3
  const target = (d) => {
    const [px, py] = anchors[d.theme]
    if (!d.mix) return [px, py]
    let dx = 0, dy = 0
    d.mix.forEach((w, i) => { if (i !== d.theme) { dx += w * (anchors[i][0] - px); dy += w * (anchors[i][1] - py) } })
    return [px + BLEND * dx, py + BLEND * dy]
  }
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  N.forEach((n) => { const [ax, ay] = target(n); n.x = ax + (rnd() - 0.5) * 80; n.y = ay + (rnd() - 0.5) * 80 })

  const NS = 'http://www.w3.org/2000/svg'
  const mk = (tag, attrs, parent) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); parent?.appendChild(el); return el }
  svg.innerHTML = ''
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
  const g = mk('g', {}, svg)
  const gHalo = mk('g', { class: 'm-halos' }, g)
  const gl = mk('g', { class: 'm-links' }, g)
  const gn = mk('g', { class: 'm-nodes' }, g)
  const gt = mk('g', { class: 'm-labels' }, g)
  const gTheme = mk('g', { class: 'm-theme-labels' }, g)
  const lEls = links.map((l) => mk('line', { class: `m-link ${l.kind}` }, gl))
  N.forEach((n) => {
    n.r = n.kind === 'topic' ? 6 + Math.sqrt(n.deg) * 2.4 : 3.5 + Math.sqrt(n.deg) * 1.3
    const col = THEMES[n.theme][1]
    n.el = mk('g', { class: `m-node ${n.kind}`, tabindex: 0, role: 'button', 'aria-label': n.label, style: `--c:${col}` }, gn)
    mk('circle', { r: n.r }, n.el)
    n.tEl = mk('text', { class: `m-label ${n.kind}`, style: `--c:${col}` }, gt); n.tEl.textContent = n.label
    n.el.addEventListener('click', (ev) => { ev.stopPropagation(); select(n) })
    n.el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') select(n) })
  })
  // label sizes measured once at base font size (screen px)
  N.forEach((n) => { n.lw = n.tEl.getComputedTextLength() || n.label.length * 6; n.tEl.style.display = 'none' })

  const sim = forceSimulation(N)
    .force('link', forceLink(links).id((d) => d.id).distance((l) => (l.kind === 'infl' ? 70 : 85)).strength((l) => (l.kind === 'infl' ? 0.05 : 0.12)))
    .force('charge', forceManyBody().strength((d) => (d.kind === 'topic' ? -360 : -120)).distanceMax(300))
    .force('x', forceX((d) => target(d)[0]).strength((d) => (d.kind === 'topic' ? 0.24 : 0.13)))
    .force('y', forceY((d) => target(d)[1]).strength((d) => (d.kind === 'topic' ? 0.24 : 0.13)))
    .force('collide', forceCollide().radius((d) => d.r + (d.kind === 'topic' ? 16 : 9)).iterations(2))
    .stop()
  for (let i = 0; i < 420; i++) sim.tick()
  links.forEach((l, i) => { const e = lEls[i]; e.setAttribute('x1', l.source.x); e.setAttribute('y1', l.source.y); e.setAttribute('x2', l.target.x); e.setAttribute('y2', l.target.y) })
  N.forEach((n) => n.el.setAttribute('transform', `translate(${n.x},${n.y})`))
  // theme halos + captions at cluster centroids
  const themeBox = THEMES.map(([name, col], i) => {
    const m = N.filter((n) => n.theme === i)
    const cx = m.reduce((s, n) => s + n.x, 0) / m.length, cy = m.reduce((s, n) => s + n.y, 0) / m.length
    const d = m.filter((n) => n.kind === 'topic').map((n) => Math.hypot(n.x - cx, n.y - cy)).sort((a, b) => a - b)
    const rad = Math.max(80, d[Math.floor(d.length * 0.85)] + 28)
    mk('circle', { cx, cy, r: rad, class: 'm-halo', style: `--c:${col}` }, gHalo)
    const xs0 = m.map((n) => n.y); const top = Math.min(...xs0) - 26
    const t = mk('text', { x: cx, y: top, class: 'm-theme-label', style: `--c:${col}` }, gTheme); t.textContent = name
    const xs = m.map((n) => n.x), ys = m.map((n) => n.y)
    return { t, cx, top, box: [Math.min(...xs), top - 14, Math.max(...xs), Math.max(...ys)] }
  })

  // view transform
  const fitTo = ([x0, y0, x1, y1], pad = 30) => {
    const kk = Math.min(W / (x1 - x0 + pad * 2), H / (y1 - y0 + pad * 2))
    return [kk, W / 2 - ((x0 + x1) / 2) * kk, H / 2 - ((y0 + y1) / 2) * kk]
  }
  const allBox = [Math.min(...N.map((n) => n.x)), Math.min(...N.map((n) => n.y), ...themeBox.map((b) => b.top - 14)), Math.max(...N.map((n) => n.x)), Math.max(...N.map((n) => n.y))]
  let [k, tx, ty] = fitTo(allBox)
  const k0 = k
  let sel = null, nb = new Set(), raf = 0
  function layoutLabels() {
    raf = 0
    const tfs0 = Math.max(13, Math.min(22, 20 * (k0 / k) ** 0.3))
    const placed = themeBox.map(({ t, cx, top }) => { const sx = cx * k + tx, sy = top * k + ty, w = t.textContent.length * tfs0 * 0.78; return [sx - w / 2, sy - tfs0 / 2 - 2, sx + w / 2, sy + tfs0 / 2 + 2] })
    const zoomed = k > k0 * 1.9
    const fs = (n) => (n.kind === 'topic' ? 12 : 10.5)
    const cands = N.filter((n) => n === sel || nb.has(n) || n.kind === 'topic' || zoomed)
      .sort((a, b) => (b === sel) - (a === sel) || nb.has(b) - nb.has(a) || (b.kind === 'topic') - (a.kind === 'topic') || b.deg - a.deg)
    const shown = new Set()
    for (const n of cands) {
      const sx = n.x * k + tx, sy = n.y * k + ty
      const f = fs(n), w = (n.lw * f) / 12, h = f + 2
      if (sx - w / 2 < 2 || sx + w / 2 > W - 2 || sy < 10 || sy > H) continue
      const y = sy - n.r * k - 4
      const bx = [sx - w / 2 - 3, y - h, sx + w / 2 + 3, y + 2]
      if (n !== sel && placed.some((p) => bx[0] < p[2] && bx[2] > p[0] && bx[1] < p[3] && bx[3] > p[1])) continue
      placed.push(bx); shown.add(n)
    }
    N.forEach((n) => {
      if (!shown.has(n)) { n.tEl.style.display = 'none'; return }
      const f = (n.kind === 'topic' ? 12 : 10.5) / k
      n.tEl.style.display = ''
      n.tEl.setAttribute('x', n.x); n.tEl.setAttribute('y', n.y - n.r - 4 / k); n.tEl.setAttribute('font-size', f); n.tEl.setAttribute('stroke-width', 3 / k)
    })
    const tfs = tfs0 / k
    themeBox.forEach(({ t }) => { t.setAttribute('font-size', tfs) })
    svg.classList.toggle('zoomed', zoomed)
    svg.style.setProperty('--k', k)
  }
  const apply = () => { g.setAttribute('transform', `translate(${tx},${ty}) scale(${k})`); if (!raf) raf = requestAnimationFrame(layoutLabels) }
  apply()
  let anim = 0
  const animateTo = ([nk, ntx, nty]) => {
    cancelAnimationFrame(anim)
    const [k1, x1, y1] = [k, tx, ty]; const t0 = performance.now()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const step = (now) => {
      const p = reduce ? 1 : Math.min(1, (now - t0) / 520), e = 1 - Math.pow(1 - p, 3)
      k = k1 + (nk - k1) * e; tx = x1 + (ntx - x1) * e; ty = y1 + (nty - y1) * e; apply()
      if (p < 1) anim = requestAnimationFrame(step)
    }
    anim = requestAnimationFrame(step)
  }
  // pan / zoom (pointer + wheel + pinch)
  const pts = new Map(); let last = null; let pinch = null; let moved = 0
  const toSvg = (cx, cy) => { const r = svg.getBoundingClientRect(); return [((cx - r.left) / r.width) * W, ((cy - r.top) / r.height) * H] }
  const zoomAt = (px, py, f) => { const nk = Math.max(k0 * 0.6, Math.min(k0 * 12, k * f)); tx = px - ((px - tx) * nk) / k; ty = py - ((py - ty) * nk) / k; k = nk; apply() }
  svg.addEventListener('wheel', (e) => { e.preventDefault(); cancelAnimationFrame(anim); const [px, py] = toSvg(e.clientX, e.clientY); zoomAt(px, py, Math.exp(-e.deltaY * 0.0015)) }, { passive: false })
  // gestures: re-baseline whenever the number of fingers changes so nothing jumps
  const rebase = () => {
    const v = [...pts.values()]
    if (v.length >= 2) { const [a, b] = v; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), mid: toSvg((a[0] + b[0]) / 2, (a[1] + b[1]) / 2) }; last = null }
    else { pinch = null; last = v[0] || null }
  }
  svg.addEventListener('pointerdown', (e) => {
    cancelAnimationFrame(anim)
    if (pts.size === 0) moved = 0
    pts.set(e.pointerId, [e.clientX, e.clientY]); rebase()
    svg.setPointerCapture?.(e.pointerId)
  })
  svg.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return
    pts.set(e.pointerId, [e.clientX, e.clientY])
    if (pts.size >= 2 && pinch) {
      const [a, b] = [...pts.values()]
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]); const mid = toSvg((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
      tx += mid[0] - pinch.mid[0]; ty += mid[1] - pinch.mid[1] // two-finger pan
      if (pinch.d > 0) zoomAt(mid[0], mid[1], d / pinch.d); else apply()
      pinch = { d, mid }; moved = 99; return
    }
    if (!last) return
    const r = svg.getBoundingClientRect(); const dx = ((e.clientX - last[0]) / r.width) * W, dy = ((e.clientY - last[1]) / r.height) * H
    last = [e.clientX, e.clientY]
    moved += Math.abs(dx) + Math.abs(dy); if (moved > 4) { tx += dx; ty += dy; apply() }
  })
  // stop Safari's own page pinch-zoom from fighting the map's zoom
  for (const t of ['gesturestart', 'gesturechange', 'gestureend']) svg.addEventListener(t, (e) => e.preventDefault())
  svg.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault() }, { passive: false })
  const end = (e) => { pts.delete(e.pointerId); rebase() }
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end); svg.addEventListener('lostpointercapture', end)
  svg.addEventListener('click', () => { if (moved < 5) select(null) })
  // theme chips zoom to a cluster
  document.querySelector('.map-themes')?.addEventListener('click', (e) => {
    const b = e.target.closest('.map-theme'); if (!b) return
    select(null)
    document.querySelectorAll('.map-theme').forEach((x) => x.classList.toggle('is-on', x === b && b.dataset.theme !== 'all'))
    animateTo(b.dataset.theme === 'all' ? [k0, ...fitTo(allBox).slice(1)] : fitTo(themeBox[+b.dataset.theme].box, 40))
  })
  const info = document.getElementById('map-info')
  function select(n) {
    if (moved > 5) return
    sel = n; nb = new Set()
    if (n) links.forEach((l) => { if (l.source === n) nb.add(l.target); if (l.target === n) nb.add(l.source) })
    N.forEach((m) => { m.el.classList.toggle('dim', !!n && m !== n && !nb.has(m)); m.el.classList.toggle('on', m === n); m.tEl.classList.toggle('dim', !!n && m !== n && !nb.has(m)) })
    links.forEach((l, i) => lEls[i].classList.toggle('hl', !!n && (l.source === n || l.target === n)))
    svg.classList.toggle('has-sel', !!n)
    if (!raf) raf = requestAnimationFrame(layoutLabels)
    if (!n) { info.hidden = true; return }
    let ids = []
    if (n.kind === 'author') ids = [...(authorBooks.get(n.label) || [])]
    else ids = TOPICS[n.label].map((r) => r[0])
    const infl = n.kind === 'author'
      ? links.filter((l) => l.kind === 'infl' && (l.source === n || l.target === n)).map((l) => (l.source === n ? `→ ${l.target.label}` : `← ${l.source.label}`))
      : []
    info.innerHTML = `<p class="mi-kind" style="color:${THEMES[n.theme][1]}">${n.kind === 'author' ? 'Author' : 'Topic'} · ${THEMES[n.theme][0]}</p><h3>${esc(n.label)}</h3>${infl.length ? `<p class="mi-infl">${esc(infl.join(' · '))}</p>` : ''}<ul>${ids
      .filter((id) => BY_ID.has(id))
      .map((id) => `<li><button type="button" class="path-link" data-book-id="${esc(id)}"><span class="path-title">${esc(BY_ID.get(id).book.title)}</span></button></li>`)
      .join('')}</ul>`
    info.hidden = false
    // keep the selected node clear of the info card (bottom sheet on phones, top-right card on desktop)
    const sx = n.x * k + tx, sy = n.y * k + ty
    const narrow = svg.clientWidth < 600
    const ir = info.getBoundingClientRect(), fr = svg.getBoundingClientRect()
    const covered = narrow ? sy > ((ir.top - fr.top) / fr.height) * H - 30 : sx > ((ir.left - fr.left) / fr.width) * W - 30 && sy < ((ir.bottom - fr.top) / fr.height) * H + 30
    if (covered || sx < 20 || sx > W - 20 || sy < 20) animateTo([k, tx + (narrow ? W / 2 : W * 0.35) - sx, ty + (narrow ? H * 0.32 : H / 2) - sy])
  }
  info.addEventListener('click', (e) => { const b = e.target.closest('[data-book-id]'); if (b) openPanel(b.dataset.bookId) })
}
