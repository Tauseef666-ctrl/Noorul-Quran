import type { TranslationEdition } from '../../types/quran'
import { getTranslationsForAyah as aqcTranslationsForAyah } from './alQuranCloudProvider'
import type { QuranProvider } from './quranProvider'

export const DEFAULT_TRANSLATION_IDS = ['en.sahih', 'ur.jalandhry'] as const
export const DEFAULT_ENGLISH_ID = 'en.sahih' as const

/**
 * Curated catalogue of published translations served by Al Quran Cloud.
 * Every entry is a real, vetted published edition — never machine-paraphrased.
 * Note: the API exposes no published Arabic *translation*; Arabic readers use
 * the original Uthmani script (rendered throughout) plus Arabic tafsir editions
 * (see Phase 11.3).
 */
export const TRANSLATION_CATALOG: readonly TranslationEdition[] = [
  // English
  { id: 'en.sahih', language: 'en', languageName: 'English', name: 'Saheeh International', translator: 'Saheeh International' },
  { id: 'en.pickthall', language: 'en', languageName: 'English', name: 'The Meaning of the Glorious Koran', translator: 'Mohammed Marmaduke William Pickthall' },
  { id: 'en.yusufali', language: 'en', languageName: 'English', name: 'The Holy Quran', translator: 'Abdullah Yusuf Ali' },
  { id: 'en.asad', language: 'en', languageName: 'English', name: 'The Message of the Quran', translator: 'Muhammad Asad' },
  { id: 'en.maududi', language: 'en', languageName: 'English', name: 'Tafhim al-Quran', translator: 'Abul Ala Maududi' },
  // Urdu
  { id: 'ur.jalandhry', language: 'ur', languageName: 'Urdu', name: 'Urdu translation', translator: 'Fateh Muhammad Jalandhry' },
  { id: 'ur.junagarhi', language: 'ur', languageName: 'Urdu', name: 'Tafsir-e-Usmani', translator: 'Muhammad Junagarhi' },
  { id: 'ur.maududi', language: 'ur', languageName: 'Urdu', name: 'Tafhim-ul-Quran', translator: 'Abul Aala Maududi' },
  // Hindi
  { id: 'hi.hindi', language: 'hi', languageName: 'Hindi', name: 'Hindi translation', translator: 'Suhel Farooq Khan and Saifur Rahman Nadwi' },
  { id: 'hi.farooq', language: 'hi', languageName: 'Hindi', name: 'Hindi translation', translator: 'Muhammad Farooq Khan and Muhammad Ahmed' },
  // Bengali
  { id: 'bn.bengali', language: 'bn', languageName: 'Bengali', name: 'Bengali translation', translator: 'Muhiuddin Khan' },
  { id: 'bn.hoque', language: 'bn', languageName: 'Bengali', name: 'Bengali translation', translator: 'Zohurul Hoque' },
  // Persian
  { id: 'fa.fooladvand', language: 'fa', languageName: 'Persian', name: 'Persian translation', translator: 'Mohammad Mahdi Fooladvand' },
  // Malay & Indonesian
  { id: 'ms.basmeih', language: 'ms', languageName: 'Malay', name: 'Tafsir Pimpinan ar-Rahman', translator: 'Abdullah Muhammad Basmeih' },
  { id: 'id.muntakhab', language: 'id', languageName: 'Indonesian', name: 'Al-Quran dan Terjemahnya', translator: 'Muhammad Quraish Shihab et al.' },
  // Turkish, Russian, Spanish, German, French
  { id: 'tr.diyanet', language: 'tr', languageName: 'Turkish', name: 'Diyanet İşleri', translator: 'Diyanet Isleri' },
  { id: 'ru.kuliev', language: 'ru', languageName: 'Russian', name: 'Russian translation', translator: 'Elmir Kuliev' },
  { id: 'es.cortes', language: 'es', languageName: 'Spanish', name: 'El Sagrado Corán', translator: 'Julio Cortes' },
  { id: 'de.bubenheim', language: 'de', languageName: 'German', name: 'Bubenheim & Elyas', translator: 'A. S. F. Bubenheim and N. Elyas' },
  { id: 'fr.hamidullah', language: 'fr', languageName: 'French', name: 'Le Coran', translator: 'Muhammad Hamidullah' },
]

/** Backwards-compatible fallback list (used when the provider can't list editions). */
export const FALLBACK_TRANSLATIONS: readonly TranslationEdition[] = TRANSLATION_CATALOG

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
