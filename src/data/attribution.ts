/**
 * Central registry of data sources, provenance, and licensing.
 *
 * Displayed on the /sources page (Phase 16) and embedded in dataset
 * provenance. Quran text is divine revelation and not copyrightable;
 * the surrounding infrastructure (APIs, translations, fonts, audio)
 * carries its own licenses which must be respected.
 */

export interface DataSourceInfo {
  id: string
  kind: 'quran-text' | 'metadata' | 'translation' | 'tafsir' | 'audio' | 'tooling'
  name: string
  url: string
  license: string
  licenseUrl?: string
  notes?: string
}

export const DATA_SOURCES: readonly DataSourceInfo[] = [
  {
    id: 'canonical-text',
    kind: 'quran-text',
    name: 'Quran text — Uthmani script (bundled)',
    url: 'https://api.quran.com/api/v4/quran/verses/uthmani',
    license: 'Public domain (divine revelation). Redistribution of the unaltered text is permitted.',
    notes:
      'Vendored verbatim via scripts/generate-quran-data.mjs from the Quran.com API v4 (Madinah Mushaf tradition). Same textual lineage as the Tanzil Uthmani edition (tanzil.net). Integrity enforced by npm run validate:quran.',
  },
  {
    id: 'navigation-metadata',
    kind: 'metadata',
    name: 'Verse navigation metadata (page/juz/hizb/rub/ruku/manzil/sajdah)',
    url: 'https://api.quran.com/api/v4/verses/by_juz/1',
    license: 'Provided freely by Quran.com (quran.foundation) for public benefit.',
    notes: 'Bundled alongside the text in src/data/canonical-quran.json.',
  },
  {
    id: 'alqurancloud',
    kind: 'translation',
    name: 'Al Quran Cloud API (translations & tafsir editions)',
    url: 'https://alquran.cloud',
    license: 'Free API. Individual translation copyrights remain with their publishers.',
    notes: 'Default translations: en.sahih (Saheeh International), ur.jalandhry (Fateh Muhammad Jalandhry).',
  },
  {
    id: 'quran-foundation',
    kind: 'tooling',
    name: 'Quran.com API v4 (search, chapter metadata, cross-validation)',
    url: 'https://quran.foundation',
    license: 'Public API; optional auth token via VITE_QURAN_FOUNDATION_API_KEY.',
  },
  {
    id: 'islamic-network-audio',
    kind: 'audio',
    name: 'Recitation audio — islamic.network CDN',
    url: 'https://cdn.islamic.network',
    license: 'Recitations served free by Islamic Network. Reciter-specific terms apply; see /sources.',
    notes: 'Per-verse and per-surah MP3s streamed on demand — never bulk-downloaded.',
  },
] as const

export const INTEGRITY_STATEMENT =
  'Every verse is served verbatim from a checksummed dataset generated from authoritative sources. ' +
  'No verse in this application is AI-generated, paraphrased, or truncated. ' +
  'Verify anytime with: npm run validate:quran.'
