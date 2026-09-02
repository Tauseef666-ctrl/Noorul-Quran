// Shared NoorulQuran brand renderer (pure Node, no deps).
// Renders the brand mark — a deep emerald hexagonal medallion with a luminous
// gold crescent-orb, a guiding-light mote, and an open Qur'an page — into an
// RGBA buffer. Used by both the web icon generator (opaque tile variant) and
// the Android asset generator (opaque splash + transparent adaptive foreground).
import { deflateSync } from 'node:zlib'

// ── PNG encoder (RGBA, no deps) ────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crc])
}
export function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(width, 4)
  ihdr[8] = 8
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ── Colour helpers ─────────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const alphaOver = (dst, src, a) => {
  const o = clamp01(a)
  return [
    Math.round(lerp(dst[0], src[0], o)),
    Math.round(lerp(dst[1], src[1], o)),
    Math.round(lerp(dst[2], src[2], o)),
    Math.max(dst[3], Math.round(o * 255)),
  ]
}

export const DEEP_BLACK = [5, 8, 7]
export const GREEN_TOP = [15, 107, 82]
export const GREEN_BOTTOM = [6, 33, 27]
export const GOLD_TOP = [238, 201, 140]
export const GOLD_BOTTOM = [199, 162, 58]
export const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]

function sdCircle(x, y, cx, cy, r) { return r - Math.hypot(x - cx, y - cy) }
function sdLine(x, y, ax, ay, bx, by) {
  const ux = bx - ax, uy = by - ay
  const len = Math.hypot(ux, uy)
  const t = clamp01(((x - ax) * ux + (y - ay) * uy) / (len * len))
  return Math.hypot(x - (ax + ux * t), y - (ay + uy * t))
}
function sdPolygon(px, py, verts) {
  // Signed distance to a convex polygon: negative inside, positive outside.
  let dist = Infinity
  let inside = false
  const n = verts.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = verts[i]
    const [xj, yj] = verts[j]
    const d = sdLine(px, py, xi, yi, xj, yj)
    if (d < dist) dist = d
    // even-odd ray casting
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside ? -dist : dist
}
function coverage(d, aa = 1) { return clamp01(0.5 - d / aa) }
// coverage for an SDF where positive = inside the shape
function fill(d, aa = 1) { return clamp01(0.5 + d / aa) }

/**
 * Render the brand mark into a square RGBA buffer.
 *
 * The mark is the "Rub el Hizb" octagram (۞) — the eight-pointed star that
 * marks every quarter of the Qur'an — drawn as two gold squares (upright and
 * rotated 45°), softened by a radiant noor glow, cradling a gold crescent-orb
 * and a single guiding-light mote. Minimal, jewelled, unmistakably Qur'anic.
 *
 * @param {number} size        canvas edge length in px
 * @param {object} [opts]
 * @param {number} [opts.contentScale] fraction of the canvas the mark spans.
 *   - opaque tile (legacy launcher / splash): use ~0.98 (near full canvas)
 *   - transparent adaptive foreground: use ~0.78 to stay inside the safe zone
 * @param {'emerald'|'transparent'} [opts.background]
 *   'emerald' fills the canvas with the dark emerald gradient behind the mark;
 *   'transparent' leaves everything outside the mark's safe circle transparent
 */
export function drawBrand(size, { contentScale = 0.98, background = 'emerald' } = {}) {
  const pixels = Buffer.alloc(size * size * 4)
  // unit: pixels-per-64-units so that the 64-unit design spans `contentScale` of the canvas
  const unit = (contentScale * size) / 64
  // Shift so the design centre (32,32) lands at the canvas centre
  const ox = -32 * unit + size / 2
  const oy = -32 * unit + size / 2

  const AA = 0.4 // anti-aliasing width in design units
  const gold = (v) => mix(GOLD_TOP, GOLD_BOTTOM, clamp01(v / 64))
  const brightGold = mix(GOLD_TOP, GOLD_BOTTOM, 0.2)

  // The octagram: two squares sharing the centre (32,32), half-length 18.5
  const sq = (rotDeg, half = 18.5) => {
    const a = (rotDeg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a)
    const p = (x, y) => [32 + x * ca - y * sa, 32 + x * sa + y * ca]
    return [p(-half, -half), p(half, -half), p(half, half), p(-half, half)]
  }
  const sqA = sq(0)  // upright square
  const sqB = sq(45) // diamond

  const C = 32, CY = 30.8, R_OUT = 7, R_IN = 5.5, GAP = 2.1

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5, py = y + 0.5
      const u = (px - ox) / unit // design-space x
      const v = (py - oy) / unit // design-space y

      let out = [0, 0, 0, 255]
      if (background === 'transparent') out = [0, 0, 0, 0]

      if (background === 'emerald') {
        out = alphaOver(out, mix(GREEN_TOP, GREEN_BOTTOM, py / size), 1)
      }

      // Radiant noor glow behind the star
      const dist = Math.hypot(u - 32, v - 32)
      if (dist < 23) out = alphaOver(out, gold(v), (1 - dist / 23) * 0.14)

      // Rub el Hizb octagram — two gold squares (upright + 45° diamond)
      const sqW = 0.7
      for (const s of [sqA, sqB]) {
        const ds = sdPolygon(u, v, s)
        if (Math.abs(ds) < sqW) out = alphaOver(out, gold(v), coverage(Math.abs(ds), sqW))
      }

      // Crescent-orb: annulus r 5.5..7 at (32,30.8), opening right
      const dCres = Math.min(
        7 - Math.hypot(u - C, v - CY),
        Math.hypot(u - (C + GAP), v - (CY + GAP * 0.35)) - 5.5,
      )
      const cresCov = fill(dCres, AA)
      if (cresCov > 0) out = alphaOver(out, gold(v), cresCov)

      // Guiding-light mote
      const dMote = 1.6 - Math.hypot(u - 32, v - 38.4)
      const moteCov = fill(dMote, AA)
      if (moteCov > 0) out = alphaOver(out, brightGold, moteCov)

      // Transparent variant: keep only content within the safe circle
      if (background === 'transparent' && dist > 30) out = [0, 0, 0, 0]

      const i = (y * size + x) * 4
      pixels[i] = out[0]; pixels[i + 1] = out[1]; pixels[i + 2] = out[2]; pixels[i + 3] = out[3]
    }
  }
  return pixels
}
