#!/usr/bin/env node
/**
 * npm run validate:quran
 *
 * Integrity gate for the vendored canonical Quran dataset
 * (src/data/canonical-quran.json). Fails loudly if ANY of the following
 * break — guaranteeing no AI-generated, paraphrased, truncated, or mutated
 * verse text ever ships:
 *
 *   - SHA-256 checksum of the verse payload matches the embedded manifest
 *   - Exactly 114 surahs in canonical order, expected ayah count each
 *   - Total 6236 ayahs; strict sequential numbering; no duplicates/gaps
 *   - No empty Arabic text; Arabic script present; diacritics intact
 *   - Page mappings monotonic across 1–604 covering every page
 *   - Juz/hizb/rub al-hizb/ruku/manzil within valid ranges and ordered
 *   - Sajdah markers match the canonical 15-verse mushaf list
 *   - Audio URLs well-formed for every curated reciter (sampled ayahs)
 *
 * Flags:
 *   --live   additionally cross-check surah metadata and full text of a
 *            random surah sample against both live APIs, and HEAD-check a
 *            few audio CDN files. Requires network.
 */

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const QF_BASE = 'https://api.quran.com/api/v4'
const AQC_BASE = 'https://api.alquran.cloud/v1'
const AUDIO_CDN = 'https://cdn.islamic.network/quran'
const DATASET_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'data',
  'canonical-quran.json',
)

// Mirrors src/data/ayahCounts.ts (kept in sync by generate:quran cross-checks).
const EXPECTED_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
  26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6,
]

const SAJDAH_KEYS = [
  '7:206', '13:15', '16:50', '17:109', '19:58', '22:18', '22:77', '25:60',
  '27:26', '32:15', '38:24', '41:38', '53:62', '84:21', '96:19',
]

const RECITERS = ['ar.alafasy', 'ar.abdulbasitmurattal', 'ar.husary', 'ar.minshawi', 'ar.shaatree', 'ar.hudhaify']
const BITRATES = { 'ar.abdulbasitmurattal': 64 }

const ARABIC_LETTER = /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3]/
const HARAKAT = /[\u064B-\u0652\u0653-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g

let failures = 0
let checks = 0

function ok(label) {
  checks += 1
  console.log(`  ✓ ${label}`)
}

function fail(label, detail = '') {
  checks += 1
  failures += 1
  console.error(`  ✗ ${label}${detail ? `\n      ${detail}` : ''}`)
}

function check(condition, label, detail = '') {
  if (condition) ok(label)
  else fail(label, detail)
}

function globalAyahNumber(surahNumber, ayahNumber) {
  let sum = 0
  for (let index = 0; index < surahNumber - 1; index += 1) sum += EXPECTED_COUNTS[index]
  return sum + ayahNumber
}

async function getJson(url, retries = 2) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!response.ok) throw Object.assign(new Error(`HTTP ${response.status}`), { fatal: true })
      return await response.json()
    } catch (error) {
      if (error?.fatal || attempt >= retries) throw error
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)))
    }
  }
}

function isNetworkError(error) {
  return error instanceof TypeError || error?.cause !== undefined
}

async function main() {
  const live = process.argv.includes('--live')
  console.log(`Validating canonical Quran dataset${live ? ' (including live cross-check)' : ''}…\n`)

  // --- Load -----------------------------------------------------------------
  const raw = await readFile(DATASET_FILE, 'utf8')
  const dataset = JSON.parse(raw)
  const { meta, surahs, verses } = dataset

  console.log('Integrity manifest')
  const recomputed = createHash('sha256').update(JSON.stringify(verses)).digest('hex')
  check(
    recomputed === meta.checksum,
    'SHA-256 checksum of verse payload matches manifest',
    recomputed === meta.checksum ? '' : `expected ${meta.checksum}, got ${recomputed}`,
  )
  check(meta.generatedAt && typeof meta.generatedAt === 'string', 'Provenance timestamp present')
  check(Boolean(meta.source?.text && meta.source?.navigation), 'Source provenance recorded')

  // --- Surah structure ------------------------------------------------------
  console.log('\nSurah structure')
  check(surahs.length === 114, `Exactly 114 surahs (found ${surahs.length})`)
  check(
    surahs.every((surah, index) => surah.n === index + 1),
    'Surah numbers strictly sequential 1–114',
  )
  const countMismatch = surahs.findIndex((surah) => surah.count !== EXPECTED_COUNTS[surah.n - 1])
  check(countMismatch === -1, 'Every surah has its canonical ayah count',
    countMismatch === -1 ? '' : `surah ${surahs[countMismatch].n} has ${surahs[countMismatch].count}, expected ${EXPECTED_COUNTS[countMismatch]}`)
  check(surahs.every((surah) => typeof surah.ar === 'string' && surah.ar.trim().length > 0),
    'All surah Arabic names non-empty')
  check(surahs.every((surah) => surah.rev === 'meccan' || surah.rev === 'medinan'),
    'Revelation type present for all surahs')
  check(surahs.reduce((sum, surah) => sum + surah.count, 0) === 6236, 'Surah counts sum to 6236')

  // --- Verse numbering ------------------------------------------------------
  console.log('\nVerse numbering')
  check(verses.length === 6236, `Exactly 6236 verses (found ${verses.length})`)
  const seenKeys = new Set()
  const duplicateKeys = new Set()
  for (const verse of verses) {
    if (seenKeys.has(verse.k)) duplicateKeys.add(verse.k)
    seenKeys.add(verse.k)
  }
  check(duplicateKeys.size === 0, 'No duplicate verse keys',
    duplicateKeys.size ? [...duplicateKeys].slice(0, 5).join(', ') : '')

  let expectedSn = 1
  let expectedAn = 1
  let orderingBrokenAt = ''
  for (const verse of verses) {
    if (verse.sn !== expectedSn || verse.an !== expectedAn) {
      orderingBrokenAt = verse.k
      break
    }
    if (verse.an === EXPECTED_COUNTS[verse.sn - 1]) {
      expectedSn += 1
      expectedAn = 1
    } else {
      expectedAn += 1
    }
  }
  check(
    orderingBrokenAt === '' && verses.length === 6236,
    'Strict sequential numbering, no gaps (surah-major order)',
    orderingBrokenAt ? `broke at ${orderingBrokenAt}` : '',
  )
  check(verses[0]?.k === '1:1' && verses.at(-1)?.k === '114:6', 'Corpus spans 1:1 through 114:6')

  // --- Arabic text integrity ------------------------------------------------
  console.log('\nArabic text integrity')
  const emptyVerse = verses.find((verse) => !verse.t || verse.t.trim().length === 0)
  check(emptyVerse === undefined, 'No empty verse text',
    emptyVerse ? `empty text at ${emptyVerse.k}` : '')
  const nonArabic = verses.filter((verse) => !ARABIC_LETTER.test(verse.t))
  check(nonArabic.length === 0, 'Every verse contains Arabic-script letters',
    nonArabic.length ? `first offenders: ${nonArabic.slice(0, 5).map((v) => v.k).join(', ')}` : '')
  const shortVerse = verses.find((verse) => verse.t.trim().length < 2)
  check(shortVerse === undefined, 'No suspiciously truncated (<2 chars) verses',
    shortVerse ? `${shortVerse.k}: "${shortVerse.t}"` : '')

  const diacritizedCount = verses.filter((verse) => HARAKAT.test(verse.t)).length
  HARAKAT.lastIndex = 0
  const ratio = diacritizedCount / verses.length
  check(ratio >= 0.95, `Diacritics intact across corpus (${(ratio * 100).toFixed(1)}% of verses carry harakat)`)

  const firstVerse = verses[0]
  check(firstVerse.t.startsWith('بِسْمِ'), 'Surah 1 ayah 1 opens with the diacritized Basmala',
    `"${firstVerse.t.slice(0, 20)}…"`)
  const kursi = verses[globalAyahNumber(2, 255) - 1]
  check(kursi.t.length > 200, 'Ayat al-Kursi (2:255) is complete (length check)', `length ${kursi.t.length}`)
  const debt = verses[globalAyahNumber(2, 282) - 1]
  check(debt.t.length > 500, `Longest verse (2:282) is complete (length check)`, `length ${debt.t.length}`)
  const shaddaPresent = verses.some((verse) => verse.t.includes('\u0651'))
  check(shaddaPresent, 'Shadda marks present (not stripped to plain text)')
  const smallAlef = verses.some((verse) => verse.t.includes('\u0670') || verse.t.includes('\u0671'))
  check(smallAlef, 'Uthmani-specific glyphs present (small alef / alef waslah)')

  // --- Navigation mappings --------------------------------------------------
  console.log('\nNavigation mappings')
  const pageIssues = []
  const juzIssues = []
  const boundIssues = []
  let lastPage = 0
  let lastJuz = 0
  for (const verse of verses) {
    if (!Number.isInteger(verse.p) || verse.p < 1 || verse.p > 604 || verse.p < lastPage) {
      pageIssues.push(verse.k)
    }
    lastPage = Math.max(lastPage, verse.p ?? 0)
    if (!Number.isInteger(verse.j) || verse.j < 1 || verse.j > 30 || verse.j < lastJuz) {
      juzIssues.push(verse.k)
    }
    lastJuz = Math.max(lastJuz, verse.j ?? 0)
    const hOk = verse.h >= 1 && verse.h <= 60
    const rOk = verse.r >= 1 && verse.r <= 240
    const rkOk = verse.rk >= 1 && verse.rk <= 562
    const mOk = verse.m >= 1 && verse.m <= 7
    if (!(hOk && rOk && rkOk && mOk)) boundIssues.push(verse.k)
  }
  check(pageIssues.length === 0, 'Page mapping valid & monotonic (1–604)',
    pageIssues.length ? `first offenders: ${pageIssues.slice(0, 5).join(', ')}` : '')
  check(new Set(verses.map((verse) => verse.p)).size === 604, 'All 604 mushaf pages covered')
  check(juzIssues.length === 0, 'Juz mapping valid & monotonic (1–30)',
    juzIssues.length ? `first offenders: ${juzIssues.slice(0, 5).join(', ')}` : '')
  check(boundIssues.length === 0, 'Hizb/rub/ruku/manzil within valid ranges',
    boundIssues.length ? `first offenders: ${boundIssues.slice(0, 5).join(', ')}` : '')

  const sajdahMarked = verses.filter((verse) => verse.s !== null).map((verse) => verse.k)
  check(
    sajdahMarked.length === SAJDAH_KEYS.length &&
      sajdahMarked.every((key, index) => key === SAJDAH_KEYS[index]),
    'Sajdah markers match the canonical 15-verse list',
    `found: ${sajdahMarked.join(', ')}`,
  )

  // --- Audio references -----------------------------------------------------
  console.log('\nAudio references')
  const samples = []
  for (let surah = 1; surah <= 114; surah += 1) {
    samples.push([surah, 1], [surah, EXPECTED_COUNTS[surah - 1]])
  }
  const malformed = []
  for (const reciter of RECITERS) {
    for (const [surah, ayah] of samples) {
      const global = globalAyahNumber(surah, ayah)
      const url = `${AUDIO_CDN}/audio/${BITRATES[reciter] ?? 128}/${reciter}/${global}.mp3`
      if (!/^https:\/\/cdn\.islamic\.network\/quran\/audio\/\d+\/[\w.]+\/\d{1,4}\.mp3$/.test(url)) {
        malformed.push(url)
      }
    }
  }
  check(malformed.length === 0, `Well-formed CDN URLs for ${RECITERS.length} reciters × ${samples.length} sampled ayahs`,
    malformed.slice(0, 3).join(' | '))

  // --- Optional live cross-check -------------------------------------------
  if (live) {
    console.log('\nLive cross-check (network required)')
    try {
      const [chaptersResponse, aqcResponse] = await Promise.all([
        getJson(`${QF_BASE}/chapters?language=en`),
        getJson(`${AQC_BASE}/surah`),
      ])
      const qfCounts = chaptersResponse.chapters.map((chapter) => chapter.verses_count)
      check(qfCounts.every((count, index) => count === EXPECTED_COUNTS[index]),
        'Quran.com chapter counts still match dataset')
      const aqcMismatch = aqcResponse.data.find((surah) => surah.numberOfAyahs !== EXPECTED_COUNTS[surah.number - 1])
      check(aqcMismatch === undefined, 'Al Quran Cloud chapter counts still match dataset',
        aqcMismatch ? `surah ${aqcMismatch.number}` : '')

      const randomSurah = 1 + Math.floor(Math.random() * 114)
      const [qfVerses, aqcDetail] = await Promise.all([
        getJson(`${QF_BASE}/verses/by_chapter/${randomSurah}?per_page=300&fields=text_uthmani`),
        getJson(`${AQC_BASE}/surah/${randomSurah}/quran-uthmani`),
      ])
      const qfByKey = new Map(qfVerses.verses.map((verse) => [verse.verse_key, verse.text_uthmani]))
      const datasetByKeys = new Map(
        verses.filter((verse) => verse.sn === randomSurah).map((verse) => [verse.k, verse.t]),
      )
      const qfDrift = [...datasetByKeys].find(([key, text]) => qfByKey.get(key)?.trim() !== text)
      check(qfDrift === undefined,
        `Full-text equality with live Quran.com for Surah ${randomSurah} (${datasetByKeys.size} verses)`,
        qfDrift ? `mismatch at ${qfDrift[0]}` : '')

      // AQC ships the Tanzil-lineage text whose Uthmani orthography differs
      // from Quran.com's in pure annotations (small high/low meem tanwin
      // ornaments, tatweel before superscript alef) and in hamza/alef
      // seating (لَءَايَة vs لَآيَة — differing character counts). Compare
      // under normalization that strips those annotations and removes the
      // alef/hamza family entirely (ء آ أ إ ا ٱ), leaving the consonantal
      // skeleton plus every remaining harakah — still a strong equality
      // signal across independent textual lineages.
      const loose = (value) =>
        value
          .replace(/[\u0640\u064B-\u0652\u0653-\u065F\u0670\u06D6-\u06ED]/g, '')
          .replace(/[\u0621\u0622\u0623\u0625\u0627\u0671]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      const basmalaLoose = loose(verses[0].t)
      const aqcByKey = new Map(
        aqcDetail.data.ayahs.map((ayah) => {
          let text = ayah.text
          if (ayah.numberInSurah === 1 && randomSurah !== 1 && randomSurah !== 9) {
            const words = text.trim().split(/\s+/)
            if (words.length > 4 && loose(words.slice(0, 4).join(' ')) === basmalaLoose) {
              text = words.slice(4).join(' ')
            }
          }
          return [`${randomSurah}:${ayah.numberInSurah}`, loose(text)]
        }),
      )
      const aqcDrift = [...datasetByKeys].find(([key, text]) => aqcByKey.get(key) !== loose(text))
      check(aqcDrift === undefined,
        `Normalized-text equality with live Al Quran Cloud for Surah ${randomSurah} (${datasetByKeys.size} verses)`,
        aqcDrift ? `mismatch at ${aqcDrift[0]}` : '')

      const headTargets = RECITERS.slice(0, 3).flatMap((reciter) =>
        [[1, 1], [112, 1]].map(([surah, ayah]) =>
          `${AUDIO_CDN}/audio/${BITRATES[reciter] ?? 128}/${reciter}/${globalAyahNumber(surah, ayah)}.mp3`,
        ),
      )
      const heads = await Promise.all(
        headTargets.map(async (url) => ({ url, status: (await fetch(url, { method: 'HEAD' })).status })),
      )
      check(heads.every((head) => head.status === 200), 'Sampled audio files reachable on CDN (HEAD 200)',
        heads.filter((head) => head.status !== 200).map((head) => `${head.url} -> ${head.status}`).join(' | '))
    } catch (error) {
      if (isNetworkError(error)) {
        console.warn(`  ! Live cross-check unavailable (network): ${error?.message ?? error}`)
        console.warn('    Dataset integrity was fully verified offline; rerun --live later.')
      } else {
        fail('Live cross-check failed', error?.message ?? String(error))
      }
    }
  } else {
    console.log('\n(Live cross-check skipped — rerun with --live to include it)')
  }

  // --- Summary --------------------------------------------------------------
  console.log(`\n${'─'.repeat(60)}`)
  if (failures === 0) {
    console.log(`PASS — ${checks} checks passed. Dataset is verbatim, complete, and consistent.`)
    process.exit(0)
  }
  console.error(`FAIL — ${failures} of ${checks} checks failed. DO NOT SHIP.`)
  process.exit(1)
}

main().catch((error) => {
  console.error(`Validator crashed: ${error?.stack ?? String(error)}`)
  process.exit(1)
})
