import { globalAyahNumber } from '../../data/ayahCounts'
import type { Reciter } from '../../types/quran'
import { fetchJson } from '../http'

export interface ReciterCatalogEntry extends Reciter {
  bitrate: number
  source: 'islamic-network-cdn'
}

export const CURATED_RECITERS: readonly ReciterCatalogEntry[] = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', bitrate: 128, source: 'islamic-network-cdn' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)', bitrate: 64, source: 'islamic-network-cdn' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', bitrate: 128, source: 'islamic-network-cdn' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq El-Minshawi', bitrate: 128, source: 'islamic-network-cdn' },
  { id: 'ar.shaatree', name: 'Abu Bakr Ash-Shaatree', bitrate: 128, source: 'islamic-network-cdn' },
  { id: 'ar.hudhaify', name: 'Ali Al-Hudhaify', bitrate: 128, source: 'islamic-network-cdn' },
]

const CDN_BASE = 'https://cdn.islamic.network/quran'

function bitrateFor(reciterId: string): number {
  return (
    CURATED_RECITERS.find((reciter) => reciter.id === reciterId)?.bitrate ?? 128
  )
}

export function verseAudioUrl(
  reciterId: string,
  surahNumber: number,
  ayahNumber: number,
): string {
  const globalAyah = globalAyahNumber(surahNumber, ayahNumber)
  return `${CDN_BASE}/audio/${bitrateFor(reciterId)}/${reciterId}/${globalAyah}.mp3`
}

export function surahAudioUrl(reciterId: string, surahNumber: number): string {
  return `${CDN_BASE}/audio-surah/128/${reciterId}/${surahNumber}.mp3`
}

interface AqcAudioEdition {
  identifier: string
  language: string
  englishName: string
  name: string
}

export async function fetchAvailableReciters(): Promise<Reciter[]> {
  const response = await fetchJson<{ data: AqcAudioEdition[] }>(
    'https://api.alquran.cloud/v1/edition/format/audio',
  )
  return response.data
    .filter((edition) => edition.identifier.startsWith('ar.'))
    .map((edition) => ({
      id: edition.identifier,
      name: edition.englishName,
      nameArabic: edition.name,
    }))
}
