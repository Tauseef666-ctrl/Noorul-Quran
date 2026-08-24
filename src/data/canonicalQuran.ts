import type { RevelationType } from '../types/quran'
import { AYAH_COUNTS, TOTAL_AYAHS } from './ayahCounts'

/**
 * Typed access to the vendored canonical Quran dataset.
 *
 * The dataset is generated exclusively by `npm run generate:quran` from
 * authoritative sources (Quran.com API v4, cross-checked against Al Quran
 * Cloud) and carries a SHA-256 checksum verified by `npm run validate:quran`.
 * Never edit `canonical-quran.json` by hand and never source verse text any
 * other way — this guarantees no AI-generated, paraphrased, or truncated
 * verses can enter the app.
 */

export interface CanonicalSurahMeta {
  n: number
  ar: string
  tr: string
  tx: string
  ur: string
  rev: Extract<RevelationType, 'meccan' | 'medinan'>
  count: number
}

export interface CanonicalVerse {
  k: string
  t: string
  p: number
  j: number
  h: number
  r: number
  rk: number
  m: number
  s: number | null
  sn: number
  an: number
}

export interface CanonicalDatasetMeta {
  generatedAt: string
  script: string
  source: {
    text: string
    navigation: string
    chapters: string
    crossCheck: string
  }
  lineage: string
  license: string
  checksum: string
  counts: { surahs: number; ayahs: number; pages: number; juzs: number }
}

export interface CanonicalDataset {
  meta: CanonicalDatasetMeta
  surahs: CanonicalSurahMeta[]
  verses: CanonicalVerse[]
}

export class CanonicalDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CanonicalDataError'
  }
}

let datasetPromise: Promise<CanonicalDataset> | null = null

export function loadCanonicalDataset(): Promise<CanonicalDataset> {
  datasetPromise ??= import('./canonical-quran.json').then((module) => {
    const dataset = module.default as CanonicalDataset
    if (!Array.isArray(dataset.verses) || dataset.verses.length !== TOTAL_AYAHS) {
      throw new CanonicalDataError(
        `Canonical dataset integrity failure: expected ${TOTAL_AYAHS} verses. Run "npm run validate:quran".`,
      )
    }
    return dataset
  })
  return datasetPromise
}

/** Index of the first verse (global array position) of each surah, plus end sentinel. */
let boundariesCache: readonly number[] | null = null

export function surahBoundaries(): readonly number[] {
  boundariesCache ??= AYAH_COUNTS.reduce<number[]>(
    (edges, count) => [...edges, edges[edges.length - 1] + count],
    [0],
  )
  return boundariesCache
}
