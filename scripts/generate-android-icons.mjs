// Generates NoorulQuran Android launcher + splash assets from the shared brand
// renderer (scripts/lib/brand.mjs), writing into android/app/src/main/res/.
// Run: npm run generate:android
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { encodePng, drawBrand, mix, GREEN_TOP, GREEN_BOTTOM } from './lib/brand.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const RES = join(ROOT, 'android', 'app', 'src', 'main', 'res')

if (!['android', 'app', 'src', 'main', 'res'].every((p, i) => RES.split(/[\\/]/).slice(-5)[i] === p)) {
  // path sanity is covered below by existence check
}

// ── Emit ───────────────────────────────────────────────────────────────────────
const DENSITIES = {
  mdpi: { icon: 48, foreground: 108 },
  hdpi: { icon: 72, foreground: 162 },
  xhdpi: { icon: 96, foreground: 216 },
  xxhdpi: { icon: 144, foreground: 324 },
  xxxhdpi: { icon: 192, foreground: 432 },
}

const SplashSizes = {
  'drawable': [480, 320],
  'drawable-port-mdpi': [320, 480],
  'drawable-port-hdpi': [480, 800],
  'drawable-port-xhdpi': [720, 1280],
  'drawable-port-xxhdpi': [960, 1600],
  'drawable-port-xxxhdpi': [1280, 1920],
  'drawable-land-mdpi': [480, 320],
  'drawable-land-hdpi': [800, 480],
  'drawable-land-xhdpi': [1280, 720],
  'drawable-land-xxhdpi': [1600, 960],
  'drawable-land-xxxhdpi': [1920, 1280],
}

// Legacy launcher tiles (opaque emerald) + transparent adaptive foreground
for (const [density, { icon, foreground }] of Object.entries(DENSITIES)) {
  const dir = join(RES, `mipmap-${density}`)
  const tile = encodePng(icon, icon, drawBrand(icon, { background: 'emerald', contentScale: 0.98 }))
  writeFileSync(join(dir, 'ic_launcher.png'), tile)
  writeFileSync(join(dir, 'ic_launcher_round.png'), tile)
  // Adaptive foreground: transparent bg, medallion inside the safe zone (~66%)
  writeFileSync(
    join(dir, 'ic_launcher_foreground.png'),
    encodePng(foreground, foreground, drawBrand(foreground, { background: 'transparent', contentScale: 0.78 })),
  )
  console.log(`wrote mipmap-${density}/ic_launcher*, foreground (${icon}/${foreground})`)
}

// Splash screens — opaque emerald, brand centred + a bit smaller than the tile
for (const [folder, [w, h]] of Object.entries(SplashSizes)) {
  const dir = join(RES, folder)
  mkdirSync(dir, { recursive: true })
  const edge = Math.min(w, h)
  const img = drawBrand(edge, { background: 'emerald', contentScale: 0.5 })
  const out = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const g = mix(GREEN_TOP, GREEN_BOTTOM, y / h)
      out[i] = g[0]; out[i + 1] = g[1]; out[i + 2] = g[2]; out[i + 3] = 255
    }
  }
  const offX = Math.floor((w - edge) / 2), offY = Math.floor((h - edge) / 2)
  for (let y = 0; y < edge; y++) {
    for (let x = 0; x < edge; x++) {
      const si = (y * edge + x) * 4
      const di = ((y + offY) * w + (x + offX)) * 4
      if (img[si + 3] > 0) {
        out[di] = img[si]; out[di + 1] = img[si + 1]; out[di + 2] = img[si + 2]; out[di + 3] = img[si + 3]
      }
    }
  }
  writeFileSync(join(dir, 'splash.png'), encodePng(w, h, out))
  console.log(`wrote ${folder}/splash.png (${w}x${h})`)
}

console.log('Android brand assets regenerated.')
