/** Procedural spine textures for photoreal book materials */

const cache = new Map()

function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function shade(rgb, amount) {
  return {
    r: Math.max(0, Math.min(255, rgb.r + amount)),
    g: Math.max(0, Math.min(255, rgb.g + amount)),
    b: Math.max(0, Math.min(255, rgb.b + amount)),
  }
}

function paintLeather(ctx, w, h, base, rand) {
  const img = ctx.createImageData(w, h)
  const d = img.data
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const n =
        Math.sin(x * 0.35 + rand() * 2) * 6 +
        Math.sin(y * 0.7) * 4 +
        (rand() - 0.5) * 28 +
        Math.sin((x + y) * 0.15) * 8
      const c = shade(base, n - 8)
      // Pore-like dark flecks
      const pore = rand() > 0.97 ? -30 : 0
      d[i] = Math.max(0, c.r + pore)
      d[i + 1] = Math.max(0, c.g + pore)
      d[i + 2] = Math.max(0, c.b + pore)
      d[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  // Soft highlight ridge
  const g = ctx.createLinearGradient(0, 0, w, 0)
  g.addColorStop(0, 'rgba(0,0,0,0.45)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.07)')
  g.addColorStop(0.55, 'rgba(255,255,255,0.12)')
  g.addColorStop(0.75, 'rgba(0,0,0,0.15)')
  g.addColorStop(1, 'rgba(0,0,0,0.5)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function paintCloth(ctx, w, h, base, rand) {
  const img = ctx.createImageData(w, h)
  const d = img.data
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const weave = ((x + y) % 3 === 0 ? 10 : 0) + ((x * 2 + y) % 5 === 0 ? -8 : 0)
      const n = weave + (rand() - 0.5) * 14
      const c = shade(base, n)
      d[i] = c.r
      d[i + 1] = c.g
      d[i + 2] = c.b
      d[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const g = ctx.createLinearGradient(0, 0, w, 0)
  g.addColorStop(0, 'rgba(0,0,0,0.4)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.06)')
  g.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function paintPaper(ctx, w, h, base, rand) {
  ctx.fillStyle = `rgb(${base.r},${base.g},${base.b})`
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.03 + rand() * 0.06})`
    ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 2, 1 + rand() * 8)
  }
  const g = ctx.createLinearGradient(0, 0, w, 0)
  g.addColorStop(0, 'rgba(0,0,0,0.25)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.08)')
  g.addColorStop(1, 'rgba(0,0,0,0.3)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function paintBoard(ctx, w, h, base, rand) {
  paintCloth(ctx, w, h, base, rand)
  // Matte dust jacket sheen
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, 'rgba(255,255,255,0.08)')
  g.addColorStop(0.4, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,0.2)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function addWear(ctx, w, h, rand) {
  ctx.globalCompositeOperation = 'multiply'
  for (let i = 0; i < 8; i++) {
    const x = rand() * w
    const y = rand() * h
    const r = 4 + rand() * 18
    const grd = ctx.createRadialGradient(x, y, 0, x, y, r)
    grd.addColorStop(0, `rgba(40,30,20,${0.15 + rand() * 0.25})`)
    grd.addColorStop(1, 'rgba(40,30,20,0)')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'
  // Edge scuffs
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fillRect(0, 0, 1, h)
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(w - 1, 0, 1, h)
}

function addBands(ctx, w, h, bandColor, rand) {
  const rgb = hexToRgb(bandColor)
  const y1 = 14 + Math.floor(rand() * 10)
  const y2 = h - 28 - Math.floor(rand() * 10)
  for (const y of [y1, y2]) {
    const grd = ctx.createLinearGradient(0, y, 0, y + 4)
    grd.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`)
    grd.addColorStop(0.4, `rgba(${Math.min(255, rgb.r + 40)},${Math.min(255, rgb.g + 30)},${Math.min(255, rgb.b + 10)},0.95)`)
    grd.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0.2)`)
    ctx.fillStyle = grd
    ctx.fillRect(3, y, w - 6, 3)
    // Foil glint
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillRect(w * 0.35, y, w * 0.2, 1)
  }
}

/**
 * Returns a data URL spine texture for the given book identity.
 */
export function spineTextureUrl({ key, material, bg, band }) {
  const cacheKey = `${key}|${material}|${bg}|${band}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const w = 48
  const h = 220
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const rand = mulberry32(hashString(cacheKey))
  const base = hexToRgb(bg)

  if (material === 'leather') paintLeather(ctx, w, h, base, rand)
  else if (material === 'cloth') paintCloth(ctx, w, h, base, rand)
  else if (material === 'paper') paintPaper(ctx, w, h, base, rand)
  else paintBoard(ctx, w, h, base, rand)

  addBands(ctx, w, h, band, rand)
  addWear(ctx, w, h, rand)

  // Occasional paper library label (minority of spines)
  if (rand() > 0.78) {
    const ly = h * (0.4 + rand() * 0.15)
    const lh = 26 + rand() * 16
    ctx.fillStyle = `rgba(${200 + rand() * 25},${188 + rand() * 20},${155 + rand() * 18},${0.72 + rand() * 0.18})`
    ctx.fillRect(6, ly, w - 12, lh)
    ctx.strokeStyle = 'rgba(40,30,20,0.4)'
    ctx.strokeRect(6.5, ly + 0.5, w - 13, lh - 1)
  }

  // Raised spine ribs on leather
  if (material === 'leather' && rand() > 0.4) {
    for (let i = 0; i < 3; i++) {
      const y = 22 + i * ((h - 50) / 3)
      const rib = ctx.createLinearGradient(0, y, 0, y + 5)
      rib.addColorStop(0, 'rgba(0,0,0,0.35)')
      rib.addColorStop(0.45, 'rgba(255,230,180,0.18)')
      rib.addColorStop(1, 'rgba(0,0,0,0.4)')
      ctx.fillStyle = rib
      ctx.fillRect(2, y, w - 4, 5)
    }
  }

  const url = canvas.toDataURL('image/png')
  cache.set(cacheKey, url)
  return url
}

export { hashString }
