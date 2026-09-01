// Generates NoorulQuran PWA icons from the shared brand renderer
// (scripts/lib/brand.mjs), writing to public/icons/. Run: npm run generate:icons
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { encodePng, drawBrand } from './lib/brand.mjs'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')

mkdirSync(OUT_DIR, { recursive: true })

const jobs = [
  ['pwa-192.png', 192, { background: 'emerald', contentScale: 0.98 }],
  ['pwa-512.png', 512, { background: 'emerald', contentScale: 0.98 }],
  ['maskable-512.png', 512, { background: 'emerald', contentScale: 0.86 }],
  ['apple-touch-icon.png', 180, { background: 'emerald', contentScale: 0.98 }],
  ['favicon-32.png', 32, { background: 'emerald', contentScale: 0.98 }],
]

for (const [name, size, opts] of jobs) {
  const png = encodePng(size, size, drawBrand(size, opts))
  writeFileSync(join(OUT_DIR, name), png)
  console.log(`wrote public/icons/${name} (${(png.length / 1024).toFixed(1)} KiB)`)
}
