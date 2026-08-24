import type {
  Ayah,
  JuzDetail,
  MushafPage,
  RevelationType,
  SajdahInfo,
  SearchHit,
  Surah,
  SurahDetail,
} from '../../types/quran'
import { appConfig } from '../../config/env'
import { ApiError, fetchJson } from '../http'
import type { FetchOptions, QuranProvider } from './quranProvider'

const BASE_URL = 'https://api.quran.com/api/v4'
const VERSES_PER_PAGE = 50

function authHeaders(): Record<string, string> {
  return appConfig.quranFoundationApiKey
    ? { 'x-auth-token': appConfig.quranFoundationApiKey }
    : {}
}

interface QfChapter {
  id: number
  name_arabic: string
  name_simple: string
  translated_name: { name: string }
  revelation_place: string
  verses_count: number
}

interface QfVerse {
  id: number
  verse_number: number
  verse_key: string
  text_uthmani?: string
  text_imlaei?: string
  page_number: number
  juz_number: number
  hizb_number: number
  rub_el_hizb_number: number
  ruku_number: number
  manzil_number: number
  sajdah_number: number | null
}

interface QfPagination {
  total_pages: number
  next_page: number | null
}

function toRevelationType(raw: string): RevelationType {
  return raw === 'madinah' ? 'medinan' : 'meccan'
}

function parseKey(key: string): { surahNumber: number; ayahNumber: number } {
  const [surahPart, ayahPart] = key.split(':')
  const surahNumber = Number.parseInt(surahPart, 10)
  const ayahNumber = Number.parseInt(ayahPart, 10)
  if (Number.isNaN(surahNumber) || Number.isNaN(ayahNumber)) {
    throw new ApiError(`Malformed verse key "${key}".`, 500)
  }
  return { surahNumber, ayahNumber }
}

function toAyah(verse: QfVerse): Ayah {
  const { surahNumber, ayahNumber } = parseKey(verse.verse_key)
  const arabic = verse.text_uthmani ?? verse.text_imlaei ?? ''
  if (!arabic) throw new ApiError(`Empty Arabic text for ${verse.verse_key}.`, 502)
  const sajdah: SajdahInfo | null =
    typeof verse.sajdah_number === 'number' && verse.sajdah_number > 0
      ? { id: verse.sajdah_number, kind: 'recommended' }
      : null
  return {
    key: verse.verse_key,
    surahNumber,
    ayahNumber,
    arabic,
    arabicSimple: verse.text_imlaei,
    navigation: {
      page: verse.page_number,
      juz: verse.juz_number,
      hizb: verse.hizb_number,
      rubElHizb: verse.rub_el_hizb_number,
      ruku: verse.ruku_number,
      manzil: verse.manzil_number,
    },
    sajdah,
  }
}

async function fetchVerses(
  path: string,
  options?: FetchOptions,
): Promise<{ ayahs: Ayah[] }> {
  const collected: Ayah[] = []
  for (let page = 1; ; page += 1) {
    const response = await fetchJson<{
      verses: QfVerse[]
      pagination: QfPagination
    }>(`${BASE_URL}${path}?per_page=${VERSES_PER_PAGE}&page=${page}&fields=text_uthmani,text_imlaei,sajdah_number`, {
      signal: options?.signal,
      headers: authHeaders(),
    })
    for (const verse of response.verses) collected.push(toAyah(verse))
    if (response.pagination.next_page === null) break
  }
  return { ayahs: collected }
}

export const quranFoundationProvider: QuranProvider = {
  id: 'quranfoundation',
  label: 'Quran Foundation (Quran.com)',
  homepage: 'https://quran.foundation',
  capabilities: { search: true, translations: false, tafsir: false },

  supportsMushaf(layout) {
    return layout === 'uthmani' || layout === 'imlaei'
  },

  async getSurahList(options?: FetchOptions): Promise<Surah[]> {
    const [english, urdu] = await Promise.all([
      fetchJson<{ chapters: QfChapter[] }>(
        `${BASE_URL}/chapters?language=en`,
        { signal: options?.signal, headers: authHeaders() },
      ),
      fetchJson<{ chapters: QfChapter[] }>(
        `${BASE_URL}/chapters?language=ur`,
        { signal: options?.signal, headers: authHeaders() },
      ).catch(() => null),
    ])
    const urduNames = new Map(
      (urdu?.chapters ?? []).map((chapter) => [chapter.id, chapter.translated_name.name]),
    )
    return english.chapters.map((chapter) => ({
      number: chapter.id,
      nameArabic: chapter.name_arabic,
      nameTransliterated: chapter.name_simple,
      nameTranslation: chapter.translated_name.name,
      nameTranslationUrdu: urduNames.get(chapter.id),
      revelationType: toRevelationType(chapter.revelation_place),
      numberOfAyahs: chapter.verses_count,
    }))
  },

  async getSurah(surahNumber: number, options?: FetchOptions): Promise<SurahDetail> {
    const [listResult, versesResult] = await Promise.all([
      this.getSurahList(options),
      fetchVerses(`/verses/by_chapter/${surahNumber}`, options),
    ])
    const meta = listResult.find((surah) => surah.number === surahNumber)
    if (!meta) throw new ApiError(`Surah ${surahNumber} was not found.`, 404)
    if (versesResult.ayahs.length !== meta.numberOfAyahs) {
      throw new ApiError(
        `Incomplete data for Surah ${surahNumber}: received ${versesResult.ayahs.length} of ${meta.numberOfAyahs} ayahs.`,
        502,
      )
    }
    return { ...meta, ayahs: versesResult.ayahs }
  },

  async getAyah(
    surahNumber: number,
    ayahNumber: number,
    options?: FetchOptions,
  ): Promise<Ayah> {
    const response = await fetchJson<{ verse: QfVerse }>(
      `${BASE_URL}/verses/by_key/${surahNumber}:${ayahNumber}?fields=text_uthmani,text_imlaei,sajdah_number`,
      { signal: options?.signal, headers: authHeaders() },
    )
    return toAyah(response.verse)
  },

  async getPage(pageNumber: number, options?: FetchOptions): Promise<MushafPage> {
    const { ayahs } = await fetchVerses(`/verses/by_page/${pageNumber}`, options)
    if (ayahs.length === 0) throw new ApiError(`Mushaf page ${pageNumber} is empty.`, 404)
    return { pageNumber, mushaf: options?.mushaf ?? 'uthmani', ayahs }
  },

  async getJuz(juzNumber: number, options?: FetchOptions): Promise<JuzDetail> {
    const [juzList, versesResult] = await Promise.all([
      fetchJson<{
        juzs: Array<{
          juz_number: number
          first_verse_range_key: string
          last_verse_range_key: string
        }>
      }>(`${BASE_URL}/juzs`, { signal: options?.signal, headers: authHeaders() }),
      fetchVerses(`/verses/by_juz/${juzNumber}`, options),
    ])
    const summary = juzList.juzs.find((juz) => juz.juz_number === juzNumber)
    if (!summary) throw new ApiError(`Juz ${juzNumber} was not found.`, 404)
    return {
      number: juzNumber,
      startKey: summary.first_verse_range_key,
      endKey: summary.last_verse_range_key,
      ayahs: versesResult.ayahs,
    }
  },

  async search(query, options): Promise<SearchHit[]> {
    const limit = options?.limit ?? 25
    const size = Math.min(Math.max(limit, 1), 50)
    const response = await fetchJson<{
      search: {
        total_results: number
        results: Array<{ verse_key: string; text: string }>
      }
    }>(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}&size=${size}&page=0&language=en`,
      { signal: options?.signal, headers: authHeaders() },
    )
    return response.search.results.map((result) => {
      const { surahNumber, ayahNumber } = parseKey(result.verse_key)
      return {
        ayahKey: result.verse_key,
        surahNumber,
        ayahNumber,
        excerptTranslation: result.text,
      }
    })
  },
}
