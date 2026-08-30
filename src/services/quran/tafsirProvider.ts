import type { TafsirContent, TafsirEdition } from '../../types/quran'
import { alQuranCloudProvider } from './alQuranCloudProvider'

/**
 * Published tafsir (commentary) editions served by Al Quran Cloud.
 * Verified 2026-08: the API's tafsir catalogue is the six Arabic editions below;
 * historically advertised English editions (en.jalalayn etc.) now silently fall
 * back to Quran text — getTafsir rejects those so we never show the ayah as
 * "commentary". Tafsir is scholarly work and is never presented as Quranic text.
 */
export const DEFAULT_TAFSIR_ID = 'ar.muyassar'

export const TAFSIR_CATALOG: readonly TafsirEdition[] = [
  { id: 'ar.muyassar', language: 'ar', languageName: 'Arabic', name: 'تفسير الميسر', translator: 'King Fahd Quran Complex' },
  { id: 'ar.jalalayn', language: 'ar', languageName: 'Arabic', name: 'تفسير الجلالين', translator: 'Jalal ad-Din al-Mahalli and Jalal ad-Din as-Suyuti' },
  { id: 'ar.qurtubi', language: 'ar', languageName: 'Arabic', name: 'تفسير القرطبي', translator: 'Imam Al-Qurtubi' },
  { id: 'ar.waseet', language: 'ar', languageName: 'Arabic', name: 'التفسير الوسيط', translator: 'Al-Waseet' },
  { id: 'ar.baghawi', language: 'ar', languageName: 'Arabic', name: 'تفسير البغوي', translator: 'Al-Baghawi' },
  { id: 'ar.miqbas', language: 'ar', languageName: 'Arabic', name: 'تنوير المقباس من تفسير ابن عباس', translator: 'Tanwir al-Miqbas (attributed to Ibn Abbas)' },
]

const KEY = 'nq:tafsir'

export function readTafsirId(): string {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored && TAFSIR_CATALOG.some((e) => e.id === stored)) return stored
  } catch {
    return DEFAULT_TAFSIR_ID
  }
  return DEFAULT_TAFSIR_ID
}

export function persistTafsirId(id: string): void {
  if (!TAFSIR_CATALOG.some((e) => e.id === id)) return
  try {
    localStorage.setItem(KEY, id)
  } catch {
    return
  }
}

export interface TafsirSource {
  listTafsirs(): Promise<TafsirEdition[]>
  tafsirForAyah(
    surahNumber: number,
    ayahNumber: number,
    tafsirId: string,
    signal?: AbortSignal,
  ): Promise<TafsirContent>
}

export const tafsirProvider: TafsirSource = {
  async listTafsirs() {
    try {
      const editions = await alQuranCloudProvider.getTafsirs?.()
      if (editions && editions.length > 0) return editions
    } catch {
      return [...TAFSIR_CATALOG]
    }
    return [...TAFSIR_CATALOG]
  },

  async tafsirForAyah(surahNumber, ayahNumber, tafsirId, signal) {
    const getTafsir = alQuranCloudProvider.getTafsir
    if (!getTafsir) {
      throw new Error('Tafsir is not available with the current provider.')
    }
    return getTafsir(surahNumber, ayahNumber, tafsirId, signal ? { signal } : undefined)
  },
}