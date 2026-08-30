// Generates PWA icons (pure Node, no deps): PNG-encodes the brand mark —
// a deep-emerald gradient tile with a luminous gold crescent + sparkle motes.
// Writes to public/icons/. Run: npm run generate:icons
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
  ihdr.writeUInt32BE(height, 4)
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

const GREEN_TOP = [20, 122, 99] // #147A63
const GREEN_BOTTOM = [6, 33, 27] // #06211B
const GOLD_TOP = [238, 210, 140] // #EED28C
const GOLD_BOTTOM = [199, 162, 58] // #C7A23A
const SPARKLE = [247, 227, 166] // #F7E3A6

// Signed-distance helpers (px). Positive = inside.
function sdCircle(x, y, cx, cy, r) {
  return r - Math.hypot(x - cx, y - cy)
}

function coverage(d, aa = 1) {
  return clamp01(0.5 - d / aa)
}

function drawIcon(size, { maskable = false } = {}) {
  const pixels = Buffer.alloc(size * size * 4)
  const radius = size * 0.22
  const inset = maskable ? size * 0.12 : 0
  const center = size / 2
  const crescentCx = center + size * 0.01
  const crescentCy = center - size * 0.04
  const outerR = size * 0.275
  const innerOx = crescentCx + outerR * 0.52
  const innerOy = crescentCy + outerR * 0.18
  const innerR = outerR * 0.92

  const motes = [
    { px: center - size * 0.27, py: center - size * 0.16, a: size * 0.075, b: size * 0.105 },
    { px: center + size * 0.27, py: center + size * 0.2, a: size * 0.055, b: size * 0.078 },
    { px: center + size * 0.16, py: center + size * 0.34, a: size * 0.035, b: size * 0.05 },
  ]

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5
      const py = y + 0.5

      // Background: rounded-rect (or full-bleed for maskable) with gradient
      const dxr = Math.max(px - size + inset + radius, inset - px, 0)
      const dyr = Math.max(py - size + inset + radius, inset - py, 0)
      const rectDist = radius - Math.hypot(dxr, dyr) // positive inside rounded rect
      let out = maskable ? [0, 0, 0, 255] : [0, 0, 0, rectDist <= 0 ? 0 : 255]
      const bg = mix(GREEN_TOP, GREEN_BOTTOM, py / size)
      out = alphaOver(out, bg, 1)

      // Soft glow behind the crescent
      const glow = sdCircle(px, py, crescentCx + size * 0.05, crescentCy + size * 0.05, outerR * 1.9)
      const glowCov = coverage(glow, size * 0.24)
      if (glowCov > 0) {
        const glowCol = mix([0.09 * 255, 0.55 * 255, 0.42 * 255], [0, 0, 0], 0.35)
        out = alphaOver(out, glowCol, glowCov * 0.5)
      }

      // Gold crescent
      const crescent =
        Math.max(sdCircle(px, py, crescentCx, crescentCy, outerR), -sdCircle(px, py, innerOx, innerOy, innerR))
      const crescentCov = coverage(crescent, 1.1) * coverage(rectDist, 1.1)
      if (crescentCov > 0) {
        const gold = mix(GOLD_TOP, GOLD_BOTTOM, py / size)
        out = alphaOver(out, gold, crescentCov)
      }

      // Sparkle motes (axis-aligned diamonds)
      for (const m of motes) {
        const dx = Math.abs(px - m.px) / m.a
        const dy = Math.abs(py - m.py) / m.b
        const d = dx + dy - 1 // <=0 inside diamond
        const c = coverage(d * Math.min(m.a, m.b), 1)
        if (c > 0) out = alphaOver(out, SPARKLE, c * coverage(rectDist, 1.1))
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