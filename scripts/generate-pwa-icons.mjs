// Generates PWA icons (pure Node, no deps): PNG-encodes the NoorulQuran brand
// mark — a deep emerald hexagonal medallion with a luminous gold crescent-orb,
// a guiding light mote, and an open Qur'an page — on a dark emerald tile.
// Matches the SVG in src/components/Brand.tsx. Writes to public/icons/.
// Run: npm run generate:icons
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')

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

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(width, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
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
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]
const alphaOver = (dst, src, a) => {
  const o = clamp01(a)
  return [
    Math.round(lerp(dst[0], src[0], o)),
    Math.round(lerp(dst[1], src[1], o)),
    Math.round(lerp(dst[2], src[2], o)),
    Math.max(dst[3], Math.round(o * 255)),
  ]
}

const DEEP_BLACK = [5, 8, 7] // #050807
const GREEN_TOP = [15, 107, 82] // #0f6b52
const GREEN_BOTTOM = [6, 33, 27] // #06211b
const GOLD_TOP = [238, 201, 140] // #eec98c
const GOLD_BOTTOM = [199, 162, 58] // #c7a23a
const GOLD_DIM = [199, 162, 58]

// Signed-distance helpers (px). Positive = inside.
function sdCircle(x, y, cx, cy, r) {
  return r - Math.hypot(x - cx, y - cy)
}
function sdLine(x, y, ax, ay, bx, by) {
  const ux = bx - ax
  const uy = by - ay
  const len = Math.hypot(ux, uy)
  const t = clamp01(((x - ax) * ux + (y - ay) * uy) / (len * len))
  const px = ax + ux * t
  const py = ay + uy * t
  return Math.hypot(x - px, y - py)
}
function coverage(d, aa = 1) {
  return clamp01(0.5 - d / aa)
}

// Is point inside the hexagon centred at (32,32) with apothem `ap`? (radius from center to side)
function hexDist(x, y, cx, cy, radius) {
  const dx = Math.abs(x - cx)
  const dy = Math.abs(y - cy)
  // hexagon with "pointy" top: apothem = radius*cos(30deg)
  if (dy * 1.7320508 > radius) return dy * 1.7320508 - radius
  return Math.max(dx * 2.0 / radius * (radius / 2), dx, dy) - radius * Math.cos(Math.PI / 6)
}
// simpler: rounded hex via polygon SDF
function sdPolygon(px, py, verts) {
  let d = Infinity
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i]
    const b = verts[(i + 1) % verts.length]
    const s = sdLine(px, py, a[0], a[1], b[0], b[1])
    if (s < d) d = s
  }
  return d
}

function drawIcon(size, { maskable = false } = {}) {
  const pixels = Buffer.alloc(size * size * 4)
  const s = size / 64 // scale factor from the 64-unit design
  const C = size / 2

  const hexVerts = (apothem) => {
    const verts = []
    // Pointy-top hexagon: vertices at angles 0,60,...,300
    const radius = apothem / Math.cos(Math.PI / 6)
    for (let i = 0; i < 6; i++) {
      const ang = (i * 60 - 30) * (Math.PI / 180)
      verts.push([C + radius * Math.cos(ang), C + radius * Math.sin(ang)])
    }
    return verts
  }

  // Geometry (in 64-unit space)
  const outerApo = 30 // outer hexagon apothem (tile edge for non-maskable)
  const outerHex = hexVerts(outerApo)
  const innerApo = 25.5
  const innerHex = hexVerts(innerApo)

  // Crescent-orb
  const orbCx = 37
  const orbCy = 21
  const orbR = 9.4
  const cutCx = orbCx + orbR * 0.55
  const cutCy = orbCy + orbR * 0.28
  const cutR = orbR * 0.78
  const mote = [37.2, 35.5]
  const moteR = 2.1

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5
      const py = y + 0.5

      // Background tile
      const bg = mix(GREEN_TOP, GREEN_BOTTOM, py / size)
      let out = [0, 0, 0, 255]
      out = alphaOver(out, bg, 1)

      if (maskable) {
        // full-bleed medallion content stays inside safe zone (radius ~36/64)
        const safe = Math.min(px, py, size - px, size - py)
        out = alphaOver(out, DEEP_BLACK, safe < size * 0.14 ? 0 : 0)
      }

      // Outer hexagon fill (darkens the edge for a medallion look)
      const outsideOuter = sdPolygon(px, py, outerHex)
      if (outsideOuter > 0) {
        out = alphaOver(out, DEEP_BLACK, coverage(outsideOuter, 1) * 0.86)
      }
      // Outer gold rim
      const rimDist = Math.abs(sdPolygon(px, py, outerHex))
      if (rimDist < 1.6) {
        const gold = mix(GOLD_TOP, GOLD_BOTTOM, py / size)
        out = alphaOver(out, gold, coverage(rimDist, 1.6))
      }
      // Inner gold hairline
      const innerDist = Math.abs(sdPolygon(px, py, innerHex))
      if (innerDist < 1.0) {
        out = alphaOver(out, GOLD_DIM, coverage(innerDist, 1.2) * 0.7)
      }

      // Soft glow behind crescent
      const glow = sdCircle(px, py, orbCx * s, orbCy * s, orbR * 2.6)
      const glowCov = coverage(glow, size * 0.2)
      if (glowCov > 0) {
        const glowCol = [0.09 * 255, 0.5 * 255, 0.4 * 255]
        out = alphaOver(out, glowCol, glowCov * 0.4)
      }

      // Gold crescent (orb minus inner cut)
      const crescent =
        Math.max(
          sdCircle(px, py, orbCx * s, orbCy * s, orbR * s),
          -sdCircle(px, py, cutCx * s, cutCy * s, cutR * s),
        )
      const crescentCov = coverage(crescent, 1.1)
      if (crescentCov > 0) {
        const gold = mix(GOLD_TOP, GOLD_BOTTOM, py / size)
        out = alphaOver(out, gold, crescentCov)
      }

      // Guiding light mote
      const moteCov = coverage(sdCircle(px, py, mote[0] * s, mote[1] * s, moteR * s), 1)
      if (moteCov > 0) {
        out = alphaOver(out, GOLD_TOP, moteCov)
      }

      // Open Qur'an page (two facing leaves) as thin gold strokes
      // Simplified: two upward-arching leaf shapes
      const leafR = 4.4
      const leafC = 32
      const leftLeaf = sdCircle(px, py, (leafC - 3.6) * s, 39.5 * s, leafR * s)
      const rightLeaf = sdCircle(px, py, (leafC + 3.6) * s, 39.5 * s, leafR * s)
      for (const d of [leftLeaf, rightLeaf]) {
        const c = coverage(d, 1)
        if (c > 0.02) {
          out = alphaOver(out, GOLD_TOP, c * 0.4)
        }
      }
      // leaf stems (outer hairlines)
      const stemL = sdLine(px, py, (leafC - 4.6) * s, 35.6 * s, (leafC - 4.6) * s, 43 * s)
      const stemR = sdLine(px, py, (leafC + 4.6) * s, 35.6 * s, (leafC + 4.6) * s, 43 * s)
      for (const d of [stemL, stemR]) {
        if (d < 0.9) {
          out = alphaOver(out, GOLD_TOP, coverage(d, 0.9))
        }
      }

      const i = (y * size + x) * 4
      pixels[i] = out[0]
      pixels[i + 1] = out[1]
      pixels[i + 2] = out[2]
      pixels[i + 3] = out[3]
    }
  }
  return pixels
}

// ── Emit ───────────────────────────────────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true })

const jobs = [
  ['pwa-192.png', 192, { maskable: false }],
  ['pwa-512.png', 512, { maskable: false }],
  ['maskable-512.png', 512, { maskable: true }],
  ['apple-touch-icon.png', 180, { maskable: false }],
  ['favicon-32.png', 32, { maskable: false }],
]

for (const [name, size, opts] of jobs) {
  const png = encodePng(size, size, drawIcon(size, opts))
  writeFileSync(join(OUT_DIR, name), png)
  console.log(`wrote public/icons/${name} (${(png.length / 1024).toFixed(1)} KiB)`)
}
