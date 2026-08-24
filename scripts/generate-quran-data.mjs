#!/usr/bin/env node
/**
 * Generates the vendored canonical Quran dataset (src/data/canonical-quran.json)
 * from authoritative sources. This is the ONLY sanctioned way Quran Arabic text
 * enters the codebase — hand-written or AI-generated verse text is forbidden.
 *
 * Sources:
 *  - Text + metadata: Quran.com API v4 (Madinah Mushaf, Uthmani script)
 *      GET /quran/verses/uthmani            -> verbatim Uthmani text, all verses
 *      GET /verses/by_juz/{1..30}           -> page/juz/hizb/rub/ruku/manzil/sajdah
 *      GET /chapters?language=en|ur         -> surah names + revelation place
 *  - Cross-check: Al Quran Cloud /surah (independent ayah counts per surah)
 *
 * The output embeds a SHA-256 checksum of the verse payload; validate:quran
 * re-verifies it on every run to detect any post-generation tampering.
 */

import { createHash } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const QF_BASE = 'https://api.quran.com/api/v4'
const AQC_BASE = 'https://api.alquran.cloud/v1'
const OUT_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'canonical-quran.json')

// Mirrors src/data/ayahCounts.ts — verified independently below against two APIs.
const EXPECTED_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
  26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6,
]

// Canonical sajdah verse keys in mushaf order (15 total, per printed mushafs).
// Quran.com's sajdah_number field omits the disputed recommended sajdah at
// 22:77, so this list — not the API flag alone — defines sajdah membership;
// the generator asserts every API-flagged verse appears in it.
export const SAJDAH_KEYS = [
  '7:206', '13:15', '16:50', '17:109', '19:58', '22:18', '22:77', '25:60',
  '27:26', '32:15', '38:24', '41:38', '53:62', '84:21', '96:19',
]

function fail(message) {
  console.error(`FATAL: ${message}`)
  process.exit(1)
}

async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) fail(`${url} responded ${response.status}`)
  return response.json()
}

async function fetchAllVersesByJuz() {
  const all = new Map()
  for (let juz = 1; juz <= 30; juz += 1) {
    let page = 1
    for (;;) {
      const url = `${QF_BASE}/verses/by_juz/${juz}?per_page=300&page=${page}&fields=sajdah_number`
      const { verses, pagination } = await getJson(url)
      for (const verse of verses) {
        if (all.has(verse.verse_key)) fail(`Duplicate verse key ${verse.verse_key} across juz fetches`)
        all.set(verse.verse_key, verse)
      }
      if (pagination.next_page === null) break
      page += 1
    }
    process.stdout.write(`  juz ${String(juz).padStart(2)}/30 — ${all.size} verses collected\r`)
  }
  process.stdout.write('\n')
  return all
}

async function main() {
  console.log('Generating canonical Quran dataset…')

  console.log('1/6 Fetching chapter lists (en, ur)…')
  const [chaptersEn, chaptersUr, aqcSurahs] = await Promise.all([
    getJson(`${QF_BASE}/chapters?language=en`),
    getJson(`${QF_BASE}/chapters?language=ur`),
    getJson(`${AQC_BASE}/surah`).catch(() => null),
  ])

  if (chaptersEn.chapters.length !== 114) fail(`Expected 114 chapters, got ${chaptersEn.chapters.length}`)

  console.log('2/6 Fetching full Uthmani text dump…')
  const textDump = await getJson(`${QF_BASE}/quran/verses/uthmani`)
  const texts = new Map()
  for (const verse of textDump.verses) texts.set(verse.verse_key, verse.text_uthmani)

  console.log('3/6 Fetching verse navigation metadata (juz 1–30)…')
  const metadata = await fetchAllVersesByJuz()

  // --- Cross-checks before anything is written -----------------------------
  console.log('4/6 Cross-checking sources…')

  if (texts.size !== 6236) fail(`Text dump has ${texts.size} verses, expected 6236`)
  if (metadata.size !== 6236) fail(`Metadata has ${metadata.size} verses, expected 6236`)
  for (const key of texts.keys()) {
    if (!metadata.has(key)) fail(`Verse ${key} has text but no metadata`)
  }
  for (const key of metadata.keys()) {
    if (!texts.has(key)) fail(`Verse ${key} has metadata but no text`)
  }

  const urduNames = new Map(chaptersUr.chapters.map((chapter) => [chapter.id, chapter.translated_name?.name]))

  chaptersEn.chapters.forEach((chapter, index) => {
    if (chapter.id !== index + 1) {
      fail(`Chapter order broken at position ${index + 1}: found id ${chapter.id}`)
    }
  })
  const countsFromApi = chaptersEn.chapters.map((chapter) => chapter.verses_count)
  if (countsFromApi.some((count, index) => count !== EXPECTED_COUNTS[index])) {
    fail('Quran.com chapter ayah counts disagree with embedded canonical table')
  }
  if (aqcSurahs) {
    const mismatch = aqcSurahs.data.find(
      (surah) => surah.numberOfAyahs !== EXPECTED_COUNTS[surah.number - 1],
    )
    if (mismatch) {
      fail(`Al Quran Cloud reports ${mismatch.numberOfAyahs} ayahs for Surah ${mismatch.number}; expected ${EXPECTED_COUNTS[mismatch.number - 1]}`)
    }
    console.log('    ✓ Al Quran Cloud counts agree with Quran.com and the embedded table')
  }

  // Global ordering must be surah-major then ayah-minor with no gaps.
  let previousSurah = 0
  let previousAyah = 0
  for (const key of texts.keys()) {
    const [surahPart, ayahPart] = key.split(':').map(Number)
    if (surahPart < previousSurah) fail(`Global order violated at ${key}`)
    if (surahPart === previousSurah && ayahPart !== previousAyah + 1) {
      fail(`Ayah numbering gap/duplicate around ${key}`)
    }
    if (surahPart > previousSurah && ayahPart !== 1) fail(`Surah ${surahPart} does not start at ayah 1 (${key})`)
    previousSurah = surahPart
    previousAyah = ayahPart
  }

  // --- Assemble ------------------------------------------------------------
  console.log('5/6 Assembling dataset…')
  const sajdahFound = []
  for (const [key, meta] of metadata) {
    if (typeof meta.sajdah_number === 'number' && meta.sajdah_number > 0) sajdahFound.push(key)
  }
  sajdahFound.sort((a, b) => {
    const [asurah, aayah] = a.split(':').map(Number)
    const [bsurah, bayah] = b.split(':').map(Number)
    return asurah - bsurah || aayah - bayah
  })
  if (sajdahFound.length !== 14 || sajdahFound.some((key) => !SAJDAH_KEYS.includes(key))) {
    fail(`API flagged unexpected sajdah verses: ${sajdahFound.join(', ')}`)
  }
  console.log('    ✓ API-flagged sajdahs are a subset of the canonical 15 (22:77 restored from mushaf convention)')
  const sajdahNumberByKey = new Map(SAJDAH_KEYS.map((key, index) => [key, index + 1]))

  const verses = []
  for (const [key, rawText] of texts) {
    const meta = metadata.get(key)
    const text = rawText.trim()
    if (!text) fail(`Empty Arabic text for ${key}`)
    const [surahNumber, ayahNumber] = key.split(':').map(Number)
    const sajdahNumber = sajdahNumberByKey.get(key) ?? null
    verses.push({
      k: key,
      t: text,
      p: meta.page_number,
      j: meta.juz_number,
      h: meta.hizb_number,
      r: meta.rub_el_hizb_number,
      rk: meta.ruku_number,
      m: meta.manzil_number,
      s: sajdahNumber,
      sn: surahNumber,
      an: ayahNumber,
    })
  }

  const payload = JSON.stringify(verses)
  const checksum = createHash('sha256').update(payload).digest('hex')

  const dataset = {
    meta: {
      generatedAt: new Date().toISOString(),
      script: 'npm run generate:quran',
      source: {
        text: 'Quran.com API v4 — /quran/verses/uthmani (Madinah Mushaf, Uthmani script)',
        navigation: 'Quran.com API v4 — /verses/by_juz/{n}',
        chapters: 'Quran.com API v4 — /chapters',
        crossCheck: 'Al Quran Cloud v1 — /surah',
      },
      lineage:
        'Uthmani script per the Madinah Mushaf; same textual lineage as the Tanzil Uthmani edition.',
      license: 'Quran text is in the public domain (unaltered revelation). Redistribution permitted.',
      checksum,
      counts: {
        surahs: 114,
        ayahs: verses.length,
        pages: 604,
        juzs: 30,
      },
    },
    surahs: chaptersEn.chapters.map((chapter) => ({
      n: chapter.id,
      ar: chapter.name_arabic,
      tr: chapter.name_simple,
      tx: chapter.translated_name?.name ?? '',
      ur: urduNames.get(chapter.id) ?? '',
      rev: chapter.revelation_place === 'madinah' ? 'medinan' : 'meccan',
      count: chapter.verses_count,
    })),
    verses,
  }

  console.log('6/6 Writing src/data/canonical-quran.json…')
  await writeFile(OUT_FILE, `${JSON.stringify(dataset)}\n`, 'utf8')
  console.log(`Done. ${verses.length} verses, sha256=${checksum.slice(0, 16)}…`)
}

main().catch((error) => fail(error?.stack ?? String(error)))
