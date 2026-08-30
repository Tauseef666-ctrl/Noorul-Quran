import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, Play, Pause } from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import type { Surah } from '../types/quran'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAudio } from '../store/audio'
import { fadeUp, staggerContainer } from '../animations'

type SortKey = 'number' | 'name' | 'ayahs' | 'revelation'
type SortDir = 'asc' | 'desc'
type RevelationFilter = 'all' | 'meccan' | 'medinan'

export default function SurahsPage() {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('number')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [revelationFilter, setRevelationFilter] = useState<RevelationFilter>('all')

  const { playSurah, mode, currentAyah, playing, pause, resume } = useAudio()

  const { data: surahs, loading, error } = useAsyncData<Surah[]>(
    (signal) => getActiveProvider().getSurahList({ signal }),
    [],
  )

  const filtered = useMemo(() => {
    if (!surahs) return []
    let result = [...surahs]

    if (revelationFilter !== 'all') {
      result = result.filter((s) => s.revelationType === revelationFilter)
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim()
      result = result.filter(
        (s) =>
          s.nameTransliterated.toLowerCase().includes(q) ||
          s.nameTranslation.toLowerCase().includes(q) ||
          s.nameArabic.includes(q) ||
          String(s.number) === q,
      )
    }

    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'number':
          cmp = a.number - b.number
          break
        case 'name':
          cmp = a.nameTransliterated.localeCompare(b.nameTransliterated)
          break
        case 'ayahs':
          cmp = a.numberOfAyahs - b.numberOfAyahs
          break
        case 'revelation':
          cmp = a.revelationType.localeCompare(b.revelationType)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [surahs, query, sortKey, sortDir, revelationFilter])

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.header variants={fadeUp}>
        <h1 className="text-2xl font-bold text-ink">Surahs</h1>
        <p className="text-sm text-ink-muted">All 114 Surahs of the Holy Quran</p>
      </motion.header>

      {/* Search and filters */}
      <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, Arabic, or number…"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            aria-label="Search surahs"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" aria-hidden />
            <select
              value={revelationFilter}
              onChange={(e) => setRevelationFilter(e.target.value as RevelationFilter)}
              className="appearance-none rounded-xl border border-line bg-surface py-2.5 pl-9 pr-8 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              aria-label="Filter by revelation type"
            >
              <option value="all">All</option>
              <option value="meccan">Meccan</option>
              <option value="medinan">Medinan</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={`${sortKey}-${sortDir}`}
              onChange={(e) => {
                const [key, dir] = e.target.value.split('-')
                setSortKey(key as SortKey)
                setSortDir(dir as SortDir)
              }}
              className="appearance-none rounded-xl border border-line bg-surface py-2.5 pl-3 pr-8 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              aria-label="Sort surahs"
            >
              <option value="number-asc">Number ↑</option>
              <option value="number-desc">Number ↓</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="ayahs-asc">Ayahs ↑</option>
              <option value="ayahs-desc">Ayahs ↓</option>
            </select>
          </div>
        </div>
      </motion.div>

      {loading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="skeleton-glass h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton-glass h-4 w-32" />
                  <div className="skeleton-glass h-3 w-20" />
                </div>
                <div className="skeleton-glass h-6 w-12" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="card rounded-2xl p-5 text-sm text-red-700 dark:text-red-300" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-ink-muted">No surahs match your search.</p>
        </div>
      )}

      {!loading && !error && (
        <motion.div variants={staggerContainer} className="grid gap-3 sm:grid-cols-2">
          {filtered.map((surah) => (
            <motion.div key={surah.number} variants={fadeUp}>
              <div className="card group relative flex items-center gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]">
                <button
                  type="button"
                  onClick={() => {
                    const playingThisSurah =
                      mode === 'surah' && currentAyah?.surahNumber === surah.number
                    if (playingThisSurah) {
                      if (playing) pause()
                      else resume()
                    } else {
                      playSurah(surah.number)
                    }
                  }}
                  aria-label={
                    mode === 'surah' && currentAyah?.surahNumber === surah.number && playing
                      ? `Pause surah ${surah.number}`
                      : `Play surah ${surah.number}`
                  }
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                    mode === 'surah' && currentAyah?.surahNumber === surah.number
                      ? 'bg-gold text-white'
                      : 'bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white'
                  }`}
                >
                  {mode === 'surah' && currentAyah?.surahNumber === surah.number && playing ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
                <Link
                  to={`/surah/${surah.number}`}
                  className="flex min-w-0 flex-1 items-center gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink truncate">{surah.number}. {surah.nameTransliterated}</p>
                    <p className="text-xs text-ink-muted">
                      {surah.nameTranslation}
                      {surah.nameTranslationUrdu ? ` · ${surah.nameTranslationUrdu}` : ''}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-faint">
                      {surah.numberOfAyahs} ayahs · {surah.revelationType}
                    </p>
                  </div>
                  <p className="arabic-heading text-xl text-ink-faint group-hover:text-ink" lang="ar" dir="rtl">
                    {surah.nameArabic}
                  </p>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
