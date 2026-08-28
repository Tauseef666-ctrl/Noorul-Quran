import { loadCanonicalDataset } from './canonicalQuran'
import type { SearchHit, Surah } from '../types/quran'

/**
 * Diacritic-insensitive Arabic search over the vendored canonical corpus.
 *
 * The entire Quran is loaded once and matched with normalized (tashkeel-free)
 * substrings, so Arabic search works fully offline and never invents verses:
 * every hit is a verbatim verse from the bundled dataset.
 */

export interface RichHit extends SearchHit {
  surahName: string
  surahNameArabic: string
}

export interface SearchReference {
  surahNumber: number
  ayahNumber: number
}

interface CorpusEntry {
  arabic: string
  normalized: string
}

interface Corpus {
  /** Global verse index → key like "2:255". */
  byIndex: string[]
  /** key → verse text. */
  byKey: Map<string, CorpusEntry>
  surahs: Surah[]
}

let corpusPromise: Promise<Corpus> | null = null

export function loadCorpus(): Promise<Corpus> {
  corpusPromise ??= buildCorpus()
  return corpusPromise
}

/** Remove tashkeel and fold common orthographic variants for matching. */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u0674\u0640]/g, '')
    .replace(/\u0671/g, '\u0627') // ٱ (alef wasla) → ا
    .replace(/\u0622/g, '\u0627') // آ → ا
    .replace(/\u0623/g, '\u0627') // أ → ا
    .replace(/\u0625/g, '\u0627') // إ → ا
    .replace(/\u0649/g, '\u064A') // ى → ي
    .replace(/\u0629/g, '\u0647') // ة → ه
}

async function buildCorpus(): Promise<Corpus> {
  const dataset = await loadCanonicalDataset()
  const byIndex: string[] = new Array(dataset.verses.length)
  const byKey = new Map<string, CorpusEntry>()

  for (let i = 0; i < dataset.verses.length; i += 1) {
    const verse = dataset.verses[i]
    const key = verse.k
    byIndex[i] = key
    byKey.set(key, {
      arabic: verse.t,
      normalized: normalizeArabic(verse.t),
    })
  }

  const surahs: Surah[] = dataset.surahs.map((meta) => ({
    number: meta.n,
    nameArabic: meta.ar,
    nameTransliterated: meta.tr,
    nameTranslation: meta.tx,
    nameTranslationUrdu: meta.ur || undefined,
    revelationType: meta.rev,
    numberOfAyahs: meta.count,
  }))

  return { byIndex, byKey, surahs }
}

/** Parse "2:255", "2 255" or "2.255" into a surah/ayah reference, if valid. */
export function resolveReference(query: string): SearchReference | null {
  const match = /^\s*(\d{1,3})\s*[:.\s,-]\s*(\d{1,3})\s*$/.exec(query)
  if (!match) return null
  const surahNumber = Number.parseInt(match[1], 10)
  const ayahNumber = Number.parseInt(match[2], 10)
  if (surahNumber < 1 || surahNumber > 114 || ayahNumber < 1) return null
  return { surahNumber, ayahNumber }
}

function parseKey(key: string): { surahNumber: number; ayahNumber: number } {
  const [surahPart, ayahPart] = key.split(':')
  return {
    surahNumber: Number.parseInt(surahPart, 10),
    ayahNumber: Number.parseInt(ayahPart, 10),
  }
}

/** Exact-reference lookup: build one verse, fully offline. */
export async function lookupReference(
  reference: SearchReference,
): Promise<RichHit | null> {
  const corpus = await loadCorpus()
  const entry = corpus.byKey.get(`${reference.surahNumber}:${reference.ayahNumber}`)
  if (!entry) return null
  const surah = corpus.surahs[reference.surahNumber - 1]
  return {
    ayahKey: `${reference.surahNumber}:${reference.ayahNumber}`,
    surahNumber: reference.surahNumber,
    ayahNumber: reference.ayahNumber,
    excerptArabic: entry.arabic,
    surahName: surah.nameTransliterated,
    surahNameArabic: surah.nameArabic,
  }
}

/** Substring Arabic search over the whole corpus (tashkeel-insensitive). */
export async function searchArabic(
  query: string,
  limit = 25,
): Promise<RichHit[]> {
  const corpus = await loadCorpus()
  const needle = normalizeArabic(query.trim())
  if (!needle) return []

  const hits: RichHit[] = []
  for (let i = 0; i < corpus.byIndex.length && hits.length < limit; i += 1) {
    const key = corpus.byIndex[i]
    const entry = corpus.byKey.get(key)
    if (!entry) continue
    if (entry.normalized.includes(needle)) {
      const { surahNumber, ayahNumber } = parseKey(key)
      const surah = corpus.surahs[surahNumber - 1]
      hits.push({
        ayahKey: key,
        surahNumber,
        ayahNumber,
        excerptArabic: entry.arabic,
        surahName: surah.nameTransliterated,
        surahNameArabic: surah.nameArabic,
      })
    }
  }
  return hits
}

/** Surah-name matches (Arabic, transliterated, or English meaning). */
export async function searchSurahNames(
  query: string,
  limit = 5,
): Promise<Surah[]> {
  const corpus = await loadCorpus()
  const lower = query.trim().toLowerCase()
  if (!lower) return []
  const needle = normalizeArabic(query.trim())

  const matches: Surah[] = []
  for (const surah of corpus.surahs) {
    if (matches.length >= limit) break
    if (
      surah.nameTransliterated.toLowerCase().includes(lower) ||
      surah.nameTranslation.toLowerCase().includes(lower) ||
      (needle && normalizeArabic(surah.nameArabic).includes(needle)) ||
      String(surah.number) === lower
    ) {
      matches.push(surah)
    }
  }
  return matches
}

/** Fill Arabic text + surah names into external (provider) hits. */
export async function enrichHits(hits: SearchHit[]): Promise<RichHit[]> {
  const corpus = await loadCorpus()
  return hits.map((hit) => {
    const entry = corpus.byKey.get(hit.ayahKey)
    const surah = corpus.surahs[hit.surahNumber - 1]
    return {
      ...hit,
      excerptArabic: hit.excerptArabic ?? entry?.arabic,
      surahName: surah?.nameTransliterated ?? '',
      surahNameArabic: surah?.nameArabic ?? '',
    }
  })
}