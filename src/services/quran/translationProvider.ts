import type { TranslationEdition } from '../../types/quran'
import { getTranslationsForAyah as aqcTranslationsForAyah } from './alQuranCloudProvider'
import type { QuranProvider } from './quranProvider'

export const DEFAULT_TRANSLATION_IDS = ['en.sahih', 'ur.jalandhry'] as const

export const FALLBACK_TRANSLATIONS: readonly TranslationEdition[] = [
  { id: 'en.sahih', language: 'en', languageName: 'English', name: 'Saheeh International', translator: 'Saheeh International' },
  { id: 'en.asad', language: 'en', languageName: 'English', name: 'The Message of the Quran', translator: 'Muhammad Asad' },
  { id: 'en.pickthall', language: 'en', languageName: 'English', name: 'The Meaning of the Glorious Koran', translator: 'Mohammed Marmaduke Pickthall' },
  { id: 'ur.jalandhry', language: 'ur', languageName: 'Urdu', name: 'Urdu Translation', translator: 'Fateh Muhammad Jalandhry' },
  { id: 'hi.farooq', language: 'hi', languageName: 'Hindi', name: 'Hindi Translation', translator: 'Muhammad Farooq Khan and Muhammad Ahmed' },
]

export interface TranslationSource {
  listTranslations(provider?: QuranProvider): Promise<TranslationEdition[]>
  translationsForAyah(
    surahNumber: number,
    ayahNumber: number,
    editionIds: readonly string[],
    signal?: AbortSignal,
  ): Promise<Record<string, string>>
}

export const translationProvider: TranslationSource = {
  async listTranslations(provider) {
    if (provider?.getTranslations) {
      try {
        const editions = await provider.getTranslations()
        if (editions.length > 0) return editions
      } catch {
        return [...FALLBACK_TRANSLATIONS]
      }
    }
    return [...FALLBACK_TRANSLATIONS]
  },

  async translationsForAyah(surahNumber, ayahNumber, editionIds, signal) {
    return aqcTranslationsForAyah(surahNumber, ayahNumber, editionIds, signal)
  },
}
