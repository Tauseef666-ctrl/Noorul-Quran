import type { QuranProvider } from './quran/quranProvider'
import type { Surah } from '../types/quran'
import {
  enrichHits,
  loadCorpus,
  lookupReference,
  resolveReference,
  searchArabic,
  searchSurahNames,
  type RichHit,
} from '../data/corpus'

export type SearchMode = 'all' | 'arabic' | 'translation'

/** Deduplicate hits by ayah key, preferring the first occurrence. */
function dedupe(hits: RichHit[]): RichHit[] {
  const seen = new Set<string>()
  const out: RichHit[] = []
  for (const hit of hits) {
    if (seen.has(hit.ayahKey)) continue
    seen.add(hit.ayahKey)
    out.push(hit)
  }
  return out
}

/**
 * Unified search: exact ayah references always resolve from the bundled
 * corpus (offline); Arabic mode searches the corpus; translation mode uses
 * the active provider; "all" merges both and deduplicates.
 */
export async function searchQuran(
  query: string,
  provider: QuranProvider,
  mode: SearchMode,
  limit = 30,
): Promise<{ hits: RichHit[]; surahs: Surah[]; reference: RichHit | null }> {
  const trimmed = query.trim()
  if (!trimmed) return { hits: [], surahs: [], reference: null }

  const reference = resolveReference(trimmed)
  if (reference) {
    const hit = await lookupReference(reference)
    return { hits: hit ? [hit] : [], surahs: [], reference: hit }
  }

  // Warm the corpus eagerly so enrichment below never waits on it.
  const corpusPromise = loadCorpus()
  void corpusPromise

  const providerHits = mode !== 'arabic' && provider.search
    ? provider
        .search(trimmed, { limit })
        .then((hits) => enrichHits(hits))
        .catch(() => [] as RichHit[])
    : Promise.resolve([] as RichHit[])

  const arabicHits = mode === 'arabic' || mode === 'all'
    ? searchArabic(trimmed, limit)
    : Promise.resolve([] as RichHit[])

  const [fromProvider, fromArabic, surahs] = await Promise.all([
    providerHits,
    arabicHits,
    searchSurahNames(trimmed, 5),
  ])

  let hits: RichHit[]
  if (mode === 'arabic') {
    hits = fromArabic
  } else if (mode === 'translation') {
    hits = fromProvider
  } else {
    hits = dedupe([...fromProvider, ...fromArabic])
  }

  return { hits, surahs, reference: null }
}