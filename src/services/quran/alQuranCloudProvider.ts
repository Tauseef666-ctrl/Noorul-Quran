import type {
  Ayah,
  JuzDetail,
  MushafLayout,
  MushafPage,
  RevelationType,
  SajdahInfo,
  SearchHit,
  Surah,
  SurahDetail,
  TafsirContent,
  TafsirEdition,
  TranslationEdition,
} from '../../types/quran'
import { TOTAL_AYAHS, surahOfGlobal } from '../../data/ayahCounts'
import { ApiError, fetchJson } from '../http'
import type { FetchOptions, QuranProvider } from './quranProvider'

const BASE_URL = 'https://api.alquran.cloud/v1'

type AqcEdition =
  | 'quran-uthmani'
  | 'quran-simple-enhanced'

interface AqcSurahListItem {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  revelationType: string
  numberOfAyahs: number
}

interface AqcSajdah {
  id: number
  recommended: boolean
  obligatory: boolean
}

interface AqcAyahItem {
  number: number
  numberInSurah: number
  text: string
  page: number
  juz: number
  manzil: number
  ruku: number
  hizbQuarter: number
  sajda: false | AqcSajdah
}

interface AqcSurahResponse {
  data: AqcSurahListItem & { ayahs: AqcAyahItem[] }
}

interface AqcAyahResponse {
  data: AqcAyahItem & { surah: AqcSurahListItem }
}

interface AqcMultiEditionResponse {
  data: Array<AqcAyahItem & { edition: { identifier: string } }>
}

interface AqcJuzResponse {
  data: {
    number: number
    ayahs: AqcAyahItem[]
    firstAyah: { surah: { number: number }; number: number }
    lastAyah: { surah: { number: number }; number: number }
  }
}

interface AqcSearchResponse {
  data: {
    count: number
    matches: Array<{
      numberInSurah: number
      text: string
      surah: { number: number }
    }> | null
  }
}

interface AqcEditionListItem {
  identifier: string
  language: string
  name: string
  englishName: string
  translator?: string
  format: string
  type: string
}

interface AqcEditionListResponse {
  data: AqcEditionListItem[]
}

function mushafToEdition(mushaf: MushafLayout): AqcEdition {
  switch (mushaf) {
    case 'uthmani':
      return 'quran-uthmani'
    case 'imlaei':
      return 'quran-simple-enhanced'
    default:
      throw new Error('IndoPak layout is not available from this source yet.')
  }
}

function toRevelationType(raw: string): RevelationType {
  return raw.toLowerCase() === 'medinan' ? 'medinan' : 'meccan'
}

function toNavigation(item: AqcAyahItem) {
  return {
    page: item.page,
    juz: item.juz,
    hizb: Math.ceil(item.hizbQuarter / 4),
    rubElHizb: item.hizbQuarter,
    ruku: item.ruku,
    manzil: item.manzil,
  }
}

function toSajdah(sajda: false | AqcSajdah): SajdahInfo | null {
  if (!sajda) return null
  return {
    id: sajda.id,
    kind: sajda.obligatory ? 'obligatory' : 'recommended',
  }
}

function stripEmbeddedBasmala(
  text: string,
  surahNumber: number,
  ayahNumber: number,
): string {
  if (ayahNumber === 1 && surahNumber !== 1 && surahNumber !== 9) {
    return text.replace(/^بِسْمِ\s+[ٱا]للَّهِ\s+[ٱا]لرَّحْمَٰنِ\s+[ٱا]لرَّحِيمِ\s*/u, '')
  }
  return text
}

function toAyah(surahNumber: number, item: AqcAyahItem): Ayah {
  return {
    key: `${surahNumber}:${item.numberInSurah}`,
    surahNumber,
    ayahNumber: item.numberInSurah,
    arabic: stripEmbeddedBasmala(item.text, surahNumber, item.numberInSurah),
    navigation: toNavigation(item),
    sajdah: toSajdah(item.sajda),
  }
}

async function ayahInfoByGlobal(globalAyah: number, signal?: AbortSignal) {
  const response = await fetchJson<AqcAyahResponse>(
    `${BASE_URL}/ayah/${globalAyah}/editions/quran-uthmani`,
    { signal },
  )
  const data = response.data
  return {
    surahNumber: data.surah.number,
    ayahNumber: data.numberInSurah,
    page: data.page,
    item: data,
  }
}

export const alQuranCloudProvider: QuranProvider = {
  id: 'alqurancloud',
  label: 'Al Quran Cloud',
  homepage: 'https://alquran.cloud',
  capabilities: { search: true, translations: true, tafsir: true },

  supportsMushaf(layout: MushafLayout): boolean {
    return layout === 'uthmani' || layout === 'imlaei'
  },

  async getSurahList(options?: FetchOptions): Promise<Surah[]> {
    const response = await fetchJson<{ data: AqcSurahListItem[] }>(
      `${BASE_URL}/surah`,
      options,
    )
    return response.data.map((item) => ({
      number: item.number,
      nameArabic: item.name,
      nameTransliterated: item.englishName,
      nameTranslation: item.englishNameTranslation,
      revelationType: toRevelationType(item.revelationType),
      numberOfAyahs: item.numberOfAyahs,
    }))
  },

  async getSurah(surahNumber: number, options?: FetchOptions): Promise<SurahDetail> {
    const edition = mushafToEdition(options?.mushaf ?? 'uthmani')
    const [list, detail] = await Promise.all([
      fetchJson<{ data: AqcSurahListItem[] }>(`${BASE_URL}/surah`, options),
      fetchJson<AqcSurahResponse>(`${BASE_URL}/surah/${surahNumber}/${edition}`, options),
    ])
    const meta = list.data.find((item) => item.number === surahNumber)
    if (!meta) throw new ApiError(`Surah ${surahNumber} was not found.`, 404)
    return {
      number: meta.number,
      nameArabic: meta.name,
      nameTransliterated: meta.englishName,
      nameTranslation: meta.englishNameTranslation,
      revelationType: toRevelationType(meta.revelationType),
      numberOfAyahs: meta.numberOfAyahs,
      ayahs: detail.data.ayahs.map((item) => toAyah(surahNumber, item)),
    }
  },

  async getAyah(
    surahNumber: number,
    ayahNumber: number,
    options?: FetchOptions,
  ): Promise<Ayah> {
    const edition = mushafToEdition(options?.mushaf ?? 'uthmani')
    const response = await fetchJson<AqcSurahResponse>(
      `${BASE_URL}/surah/${surahNumber}:${ayahNumber}/${edition}`,
      options,
    )
    return toAyah(surahNumber, response.data.ayahs[0])
  },

  async getPage(pageNumber: number, options?: FetchOptions): Promise<MushafPage> {
    if (pageNumber < 1 || pageNumber > 604) {
      throw new ApiError(`Mushaf page ${pageNumber} is out of range (1–604).`, 404)
    }
    let low = 1
    let high = TOTAL_AYAHS
    while (low < high) {
      const mid = Math.floor((low + high) / 2)
      const info = await ayahInfoByGlobal(mid, options?.signal)
      if (info.page >= pageNumber) high = mid
      else low = mid + 1
    }

    const ayahs: Ayah[] = []
    let cursor = low
    while (cursor <= TOTAL_AYAHS) {
      const info = await ayahInfoByGlobal(cursor, options?.signal)
      if (info.page !== pageNumber) break
      ayahs.push(toAyah(info.surahNumber, info.item))
      cursor += 1
    }
    if (ayahs.length === 0) throw new ApiError(`Page ${pageNumber} is empty.`, 404)
    return { pageNumber, mushaf: options?.mushaf ?? 'uthmani', ayahs }
  },

  async getJuz(juzNumber: number, options?: FetchOptions): Promise<JuzDetail> {
    const response = await fetchJson<AqcJuzResponse>(
      `${BASE_URL}/juz/${juzNumber}/quran-uthmani`,
      options,
    )
    const { data } = response
    const ayahs: Ayah[] = []
    for (const item of data.ayahs) {
      ayahs.push(toAyah(surahOfGlobal(item.number), item))
    }
    return {
      number: data.number,
      startKey: `${data.firstAyah.surah.number}:${data.firstAyah.number}`,
      endKey: `${data.lastAyah.surah.number}:${data.lastAyah.number}`,
      ayahs,
    }
  },

  async search(query, options): Promise<SearchHit[]> {
    const limit = options?.limit ?? 25
    const response = await fetchJson<AqcSearchResponse>(
      `${BASE_URL}/search/${encodeURIComponent(query)}/all/en.sahih`,
      options,
    )
    const matches = response.data.matches ?? []
    return matches.slice(0, limit).map((match) => ({
      ayahKey: `${match.surah.number}:${match.numberInSurah}`,
      surahNumber: match.surah.number,
      ayahNumber: match.numberInSurah,
      excerptTranslation: match.text,
    }))
  },

  async getTranslations(): Promise<TranslationEdition[]> {
    const response = await fetchJson<AqcEditionListResponse>(
      `${BASE_URL}/edition?format=text&type=translation`,
    )
    return response.data.map((item) => ({
      id: item.identifier,
      language: item.language,
      languageName: item.englishName,
      name: item.name,
      translator: item.translator ?? item.name,
    }))
  },

  async getTafsirs(): Promise<TafsirEdition[]> {
    const response = await fetchJson<AqcEditionListResponse>(
      `${BASE_URL}/edition?format=text&type=tafsir`,
    )
    return response.data.map((item) => ({
      id: item.identifier,
      language: item.language,
      languageName: item.englishName,
      name: item.name,
    }))
  },

  async getTafsir(
    surahNumber: number,
    ayahNumber: number,
    tafsirId: string,
    options?: FetchOptions,
  ): Promise<TafsirContent> {
    const response = await fetchJson<{
      data: {
        text: string
        edition: { identifier: string; language: string; englishName: string; name: string; type: string }
      }
    }>(`${BASE_URL}/ayah/${surahNumber}:${ayahNumber}/${tafsirId}`, options)
    // Safety: if the edition id is stale/unsupported the API silently returns the
    // raw quran-uthmani text instead of commentary. Never present Quran text as tafsir.
    if (response.data.edition.type !== 'tafsir') {
      throw new Error(
        `Tafsir edition "${tafsirId}" is not available — the API is not serving it.`,
      )
    }
    return {
      ayahKey: `${surahNumber}:${ayahNumber}`,
      tafsirId,
      language: response.data.edition.language,
      name: response.data.edition.englishName,
      text: response.data.text,
    }
  },
}

export async function getTranslationsForAyah(
  surahNumber: number,
  ayahNumber: number,
  editionIds: readonly string[],
  signal?: AbortSignal,
): Promise<Record<string, string>> {
  const response = await fetchJson<AqcMultiEditionResponse>(
    `${BASE_URL}/ayah/${surahNumber}:${ayahNumber}/editions/${editionIds.join(',')}`,
    { signal },
  )
  const result: Record<string, string> = {}
  for (const item of response.data) {
    result[item.edition.identifier] = item.text
  }
  return result
}
