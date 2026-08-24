import type {
  Ayah,
  JuzDetail,
  MushafLayout,
  MushafPage,
  SearchHit,
  Surah,
  SurahDetail,
  TafsirContent,
  TafsirEdition,
  TranslationEdition,
} from '../../types/quran'

export interface FetchOptions {
  mushaf?: MushafLayout
  signal?: AbortSignal
}

export interface ProviderCapabilities {
  search: boolean
  translations: boolean
  tafsir: boolean
}

export interface QuranProvider {
  readonly id: string
  readonly label: string
  readonly homepage: string
  readonly capabilities: ProviderCapabilities
  supportsMushaf(layout: MushafLayout): boolean
  getSurahList(options?: FetchOptions): Promise<Surah[]>
  getSurah(surahNumber: number, options?: FetchOptions): Promise<SurahDetail>
  getAyah(surahNumber: number, ayahNumber: number, options?: FetchOptions): Promise<Ayah>
  getPage(pageNumber: number, options?: FetchOptions): Promise<MushafPage>
  getJuz(juzNumber: number, options?: FetchOptions): Promise<JuzDetail>
  search?(query: string, options?: FetchOptions & { limit?: number }): Promise<SearchHit[]>
  getTranslations?(): Promise<TranslationEdition[]>
  getTafsirs?(): Promise<TafsirEdition[]>
  getTafsir?(
    surahNumber: number,
    ayahNumber: number,
    tafsirId: string,
    options?: FetchOptions,
  ): Promise<TafsirContent>
}
