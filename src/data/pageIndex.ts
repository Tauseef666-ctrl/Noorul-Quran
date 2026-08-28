import { loadCanonicalDataset } from './canonicalQuran'
import { isValidAyah, MUSHAF_PAGE_COUNT } from './ayahCounts'

/**
 * Page-boundary index for the standard 604-page Madinah mushaf, derived from
 * the vendored canonical dataset. The dataset's per-verse navigation metadata
 * is the authoritative Uthmani page reference used for jump-to navigation and
 * "X of Y" indicators. Actual page rendering still respects the active
 * provider's selected mushaf edition via `getPage(..., { mushaf })`.
 */

export interface PageIndex {
  /** First page of each surah (1-indexed by surah number). */
  surahFirstPage: readonly number[]
  /** First page of each juz (1-indexed by juz number). */
  juzFirstPage: readonly number[]
  /** Canonical surah metadata for the jump-to dialog (bundled, offline-safe). */
  surahs: readonly { number: number; nameArabic: string; nameTransliterated: string }[]
  /** Resolve a surah:ayah reference to its 604-page-mushaf page, or null. */
  pageForAyah: (surahNumber: number, ayahNumber: number) => number | null
  /** Total pages of the standard mushaf. */
  pageCount: number
  /** Resolve a page number to its first ayah's surah (for surah number jump display). */
  firstSurahOfPage: (pageNumber: number) => number | null
}

let indexPromise: Promise<PageIndex> | null = null

export function loadPageIndex(): Promise<PageIndex> {
  indexPromise ??= buildPageIndex()
  return indexPromise
}

async function buildPageIndex(): Promise<PageIndex> {
  const dataset = await loadCanonicalDataset()

  const surahFirstPage = new Array<number>(114).fill(1)
  const juzFirstPage = new Array<number>(30).fill(1)
  const pageForAyah = new Map<string, number>()
  const firstSurahOfPage = new Map<number, number>()

  let prevSurah = 0
  let prevJuz = 0
  let prevPage = 0

  for (const verse of dataset.verses) {
    if (verse.sn !== prevSurah) {
      surahFirstPage[verse.sn - 1] = verse.p
      prevSurah = verse.sn
    }
    if (verse.j !== prevJuz) {
      juzFirstPage[verse.j - 1] = verse.p
      prevJuz = verse.j
    }
    if (verse.p !== prevPage) {
      firstSurahOfPage.set(verse.p, verse.sn)
      prevPage = verse.p
    }
    pageForAyah.set(`${verse.sn}:${verse.an}`, verse.p)
  }

  return {
    surahFirstPage,
    juzFirstPage,
    surahs: dataset.surahs.map((meta) => ({
      number: meta.n,
      nameArabic: meta.ar,
      nameTransliterated: meta.tr,
    })),
    pageForAyah: (surahNumber, ayahNumber) =>
      isValidAyah(surahNumber, ayahNumber)
        ? pageForAyah.get(`${surahNumber}:${ayahNumber}`) ?? null
        : null,
    pageCount: MUSHAF_PAGE_COUNT,
    firstSurahOfPage: (pageNumber) => firstSurahOfPage.get(pageNumber) ?? null,
  }
}