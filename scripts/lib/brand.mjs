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
 * @param {number} size        canvas edge length in px
 * @param {object} [opts]
 * @param {number} [opts.contentScale] fraction of the canvas the medallion spans.
 *   - opaque tile (legacy launcher / splash): use ~0.98 (near full canvas)
 *   - transparent adaptive foreground: use ~0.66 to stay inside the safe zone
 * @param {'emerald'|'transparent'} [opts.background]
 *   'emerald' fills the canvas with the dark emerald gradient behind the medallion;
 *   'transparent' leaves everything outside the medallion fully transparent
 */
export function drawBrand(size, { contentScale = 0.98, background = 'emerald' } = {}) {
  const pixels = Buffer.alloc(size * size * 4)
  // unit: pixels-per-64-units so that the 64-unit design spans `contentScale` of the canvas
  const unit = (contentScale * size) / 64
  // Shift so the design centre (32,32) lands at the canvas centre
  const ox = -32 * unit + size / 2
  const oy = -32 * unit + size / 2

  // Hexagon vertices in 64-unit design space (pointy-top, centred at 32,32)
  const hexVertsUnit = (apothem) => {
    const verts = []
    const r = apothem / Math.cos(Math.PI / 6)
    for (let i = 0; i < 6; i++) {
      const ang = (i * 60 - 30) * (Math.PI / 180)
      verts.push([32 + r * Math.cos(ang), 32 + r * Math.sin(ang)])
    }
    return verts
  }
  const outerVerts = hexVertsUnit(24.25) // SVG `M32 4 56 18v28L32 60 8 46V18Z` (circumradius 28)
  const innerVerts = hexVertsUnit(18.18) // SVG `M32 11 50.6 22v20L32 53 13.4 42V22Z` (circumradius 21)
  const clipVerts = hexVertsUnit(24.25 + 7) // transparent-clip margin

  const AA = 0.4 // anti-aliasing width in design units
  const gold = (v) => mix(GOLD_TOP, GOLD_BOTTOM, clamp01(v / 64))

  // Crescent local frame: SVG group is rotate(24) about (37,25); we inverse-rotate each sample
  const rot = (-24 * Math.PI) / 180
  const cosR = Math.cos(rot)
  const sinR = Math.sin(rot)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5, py = y + 0.5
      const u = (px - ox) / unit // design-space x
      const v = (py - oy) / unit // design-space y

      let out = [0, 0, 0, 255]
      if (background === 'transparent') out = [0, 0, 0, 0]

      // Medallion face fill: emerald always inside the hexagon; whole tile for tiles
      const outerSd = sdPolygon(u, v, outerVerts)
      if (background === 'emerald') {
        out = alphaOver(out, mix(GREEN_TOP, GREEN_BOTTOM, py / size), 1)
        if (outerSd > 0) out = alphaOver(out, DEEP_BLACK, coverage(outerSd, 1.2) * 0.5)
      } else if (outerSd <= 0) {
        out = alphaOver(out, mix(GREEN_TOP, GREEN_BOTTOM, py / size), 1)
      }

      // Outer gold rim (SVG strokeWidth 1.6)
      const rimW = 0.8
      if (Math.abs(outerSd) < rimW) out = alphaOver(out, gold(v), coverage(Math.abs(outerSd), rimW))

      // Inner gold hairline (SVG strokeWidth 0.9, opacity 0.65)
      const inW = 0.45
      if (Math.abs(sdPolygon(u, v, innerVerts)) < inW) {
        out = alphaOver(out, gold(v), coverage(Math.abs(sdPolygon(u, v, innerVerts)), inW) * 0.65)
      }

      // Crescent-orb: annulus r 7.2..8.5 at (37.5,25), rotated 24deg, opening right
      const cu = (u - 37) * cosR - (v - 25) * sinR + 37
      const cv = (u - 37) * sinR + (v - 25) * cosR + 25
      const dcx = cu - 37.5
      const dcx2 = cv - 25
      const cdist = Math.hypot(dcx, dcx2)
      const dCrescent = Math.min(8.5 - cdist, cdist - 7.2, -dcx)
      const crescentCov = fill(dCrescent, AA)
      if (crescentCov > 0) out = alphaOver(out, gold(v), crescentCov)

      // Guiding-light mote (SVG circle r=1.7 at 37,38.4)
      const dMote = 1.7 - Math.hypot(u - 37, v - 38.4)
      const moteCov = fill(dMote, AA)
      if (moteCov > 0) out = alphaOver(out, gold(v), moteCov)

      // Open Qur'an page — two stroked leaf ellipses (SVG stroked leaf paths)
      const leafW = 0.75 // strokeWidth 1.5 / 2
      for (const leafCx of [21.5, 42.5]) {
        const du = (u - leafCx) / 6
        const dv = (v - 37.8) / 4
        const d = Math.hypot(du, dv)
        const sdf = (1 - d) * 4 // positive when inside the ellipse (approx, units-ish)
        if (Math.abs(sdf) < leafW) {
          out = alphaOver(out, gold(v), coverage(Math.abs(sdf), leafW) * 0.5)
        }
      }

      // Transparent variant: keep only content around the medallion
      if (background === 'transparent' && sdPolygon(u, v, clipVerts) > 0) {
        out = [0, 0, 0, 0]
      }

      const i = (y * size + x) * 4
      pixels[i] = out[0]; pixels[i + 1] = out[1]; pixels[i + 2] = out[2]; pixels[i + 3] = out[3]
    }
  }
  return pixels
}
