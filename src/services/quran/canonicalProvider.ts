import type {
  Ayah,
  JuzDetail,
  MushafLayout,
  MushafPage,
  RevelationType,
  SajdahInfo,
  Surah,
  SurahDetail,
} from '../../types/quran'
import {
  CanonicalDataError,
  loadCanonicalDataset,
  surahBoundaries,
} from '../../data/canonicalQuran'
import { isValidAyah, isValidSurah } from '../../data/ayahCounts'
import type { QuranProvider } from './quranProvider'

/**
 * Provider backed entirely by the vendored canonical dataset. Serves the
 * Uthmani text verbatim from the app bundle — no network required and zero
 * risk of upstream mutation. Translations, tafsir and search remain the job
 * of the remote providers.
 */

function toSajdah(number: number | null): SajdahInfo | null {
  return number === null ? null : { id: number, kind: 'recommended' }
}

export const canonicalProvider: QuranProvider = {
  id: 'canonical',
  label: 'Bundled Uthmani (canonical)',
  homepage: 'https://quran.com',
  capabilities: { search: false, translations: false, tafsir: false },

  supportsMushaf(layout: MushafLayout): boolean {
    return layout === 'uthmani'
  },

  async getSurahList(): Promise<Surah[]> {
    const dataset = await loadCanonicalDataset()
    return dataset.surahs.map((meta) => ({
      number: meta.n,
      nameArabic: meta.ar,
      nameTransliterated: meta.tr,
      nameTranslation: meta.tx,
      nameTranslationUrdu: meta.ur || undefined,
      revelationType: meta.rev as RevelationType,
      numberOfAyahs: meta.count,
    }))
  },

  async getSurah(surahNumber: number): Promise<SurahDetail> {
    if (!isValidSurah(surahNumber)) throw new CanonicalDataError(`Invalid surah ${surahNumber}.`)
    const dataset = await loadCanonicalDataset()
    const boundaries = surahBoundaries()
    const meta = dataset.surahs[surahNumber - 1]
    const start = boundaries[surahNumber - 1]
    const end = boundaries[surahNumber]
    const ayahs: Ayah[] = []
    for (let index = start; index < end; index += 1) {
      const verse = dataset.verses[index]
      ayahs.push({
        key: verse.k,
        surahNumber: verse.sn,
        ayahNumber: verse.an,
        arabic: verse.t,
        navigation: {
          page: verse.p,
          juz: verse.j,
          hizb: verse.h,
          rubElHizb: verse.r,
          ruku: verse.rk,
          manzil: verse.m,
        },
        sajdah: toSajdah(verse.s),
      })
    }
    if (ayahs.length !== meta.count) {
      throw new CanonicalDataError(
        `Surah ${surahNumber} has ${ayahs.length} ayahs in dataset, expected ${meta.count}.`,
      )
    }
    return {
      number: meta.n,
      nameArabic: meta.ar,
      nameTransliterated: meta.tr,
      nameTranslation: meta.tx,
      nameTranslationUrdu: meta.ur || undefined,
      revelationType: meta.rev as RevelationType,
      numberOfAyahs: meta.count,
      ayahs,
    }
  },

  async getAyah(surahNumber: number, ayahNumber: number): Promise<Ayah> {
    const surah = await this.getSurah(surahNumber)
    if (!isValidAyah(surahNumber, ayahNumber)) {
      throw new CanonicalDataError(`Invalid ayah ${surahNumber}:${ayahNumber}.`)
    }
    return surah.ayahs[ayahNumber - 1]
  },

  async getPage(pageNumber: number): Promise<MushafPage> {
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 604) {
      throw new CanonicalDataError(`Mushaf page ${pageNumber} is out of range (1–604).`)
    }
    const dataset = await loadCanonicalDataset()
    const ayahs: Ayah[] = []
    for (const verse of dataset.verses) {
      if (verse.p !== pageNumber) continue
      ayahs.push({
        key: verse.k,
        surahNumber: verse.sn,
        ayahNumber: verse.an,
        arabic: verse.t,
        navigation: {
          page: verse.p,
          juz: verse.j,
          hizb: verse.h,
          rubElHizb: verse.r,
          ruku: verse.rk,
          manzil: verse.m,
        },
        sajdah: toSajdah(verse.s),
      })
    }
    if (ayahs.length === 0) throw new CanonicalDataError(`Mushaf page ${pageNumber} is empty.`)
    return { pageNumber, mushaf: 'uthmani', ayahs }
  },

  async getJuz(juzNumber: number): Promise<JuzDetail> {
    if (!Number.isInteger(juzNumber) || juzNumber < 1 || juzNumber > 30) {
      throw new CanonicalDataError(`Juz ${juzNumber} is out of range (1–30).`)
    }
    const dataset = await loadCanonicalDataset()
    const ayahs: Ayah[] = []
    let startKey: string | null = null
    let endKey: string | null = null
    for (const verse of dataset.verses) {
      if (verse.j !== juzNumber) continue
      startKey ??= verse.k
      endKey = verse.k
      ayahs.push({
        key: verse.k,
        surahNumber: verse.sn,
        ayahNumber: verse.an,
        arabic: verse.t,
        navigation: {
          page: verse.p,
          juz: verse.j,
          hizb: verse.h,
          rubElHizb: verse.r,
          ruku: verse.rk,
          manzil: verse.m,
        },
        sajdah: toSajdah(verse.s),
      })
    }
    if (startKey === null || endKey === null) {
      throw new CanonicalDataError(`Juz ${juzNumber} is empty in the canonical dataset.`)
    }
    return { number: juzNumber, startKey, endKey, ayahs }
  },
}
