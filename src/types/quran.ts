export type RevelationType = 'meccan' | 'medinan'

export type MushafLayout = 'uthmani' | 'imlaei' | 'indopak'

export interface SajdahInfo {
  id: number
  kind: 'recommended' | 'obligatory'
}

export interface AyahNavigation {
  page: number
  juz: number
  hizb: number
  rubElHizb: number
  ruku: number
  manzil: number
}

export interface Ayah {
  key: string
  surahNumber: number
  ayahNumber: number
  arabic: string
  arabicSimple?: string
  navigation: AyahNavigation
  sajdah: SajdahInfo | null
}

export interface Surah {
  number: number
  nameArabic: string
  nameTransliterated: string
  nameTranslation: string
  nameTranslationUrdu?: string
  revelationType: RevelationType
  numberOfAyahs: number
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[]
}

export interface MushafPage {
  pageNumber: number
  mushaf: MushafLayout
  ayahs: Ayah[]
}

export interface VerseRange {
  startKey: string
  endKey: string
}

export interface JuzSummary extends VerseRange {
  number: number
}

export interface JuzDetail extends JuzSummary {
  ayahs: Ayah[]
}

export interface SearchHit {
  ayahKey: string
  surahNumber: number
  ayahNumber: number
  excerptArabic?: string
  excerptTranslation?: string
}

export interface TranslationEdition {
  id: string
  language: string
  languageName: string
  name: string
  translator: string
}

export interface TafsirEdition {
  id: string
  language: string
  languageName: string
  name: string
  translator?: string
}

export interface TafsirContent {
  ayahKey: string
  tafsirId: string
  name: string | null
  language: string
  text: string
}

export interface Reciter {
  id: string
  name: string
  nameArabic?: string
}
