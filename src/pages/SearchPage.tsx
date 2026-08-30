import { useState, useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  BookOpen,
  Loader2,
  Play,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import { searchQuran, type SearchMode } from '../services/search'
import type { RichHit } from '../data/corpus'
import type { Surah } from '../types/quran'
import { useAudio } from '../store/audio'
import { GeometricPattern } from '../components/GeometricPattern'
import { EqualizerBars } from '../components/EqualizerBars'
import { fadeUp, staggerContainer } from '../animations'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

/* Subtle gold highlight of the queried slice of a result excerpt. */
function Highlighted({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{text}</>
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-gold/25 px-0.5 text-ink">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  )
}

const MODES: { id: SearchMode; label: string; sub: string }[] = [
  { id: 'all', label: 'All', sub: 'Arabic + translations' },
  { id: 'arabic', label: 'Arabic', sub: 'Offline corpus' },
  { id: 'translation', label: 'Translation', sub: 'Provider' },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('all')
  const [hits, setHits] = useState<RichHit[]>([])
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [reference, setReference] = useState<RichHit | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [matchesProvider, setMatchesProvider] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const requestIdRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toggle, playing, isCurrentAyah } = useAudio()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const modeRef = useRef(mode)

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    const requestId = ++requestIdRef.current
    const effectiveMode = modeRef.current

    if (!trimmed) {
      setHits([])
      setSurahs([])
      setReference(null)
      setSearched(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const provider = getActiveProvider()
      const { hits: nextHits, surahs: nextSurahs, reference: nextRef } = await searchQuran(
        trimmed,
        provider,
        effectiveMode,
      )
      if (requestIdRef.current !== requestId) return
      setHits(nextHits)
      setSurahs(nextSurahs)
      setReference(nextRef)
      setMatchesProvider(!!provider.search && effectiveMode !== 'arabic')
      if (!provider.search && effectiveMode === 'translation') {
        setError('Translation search is not available with the current provider. Try Arabic or All.')
      }
    } catch (err) {
      if (requestIdRef.current !== requestId) return
      setError(err instanceof Error ? err.message : 'Search failed.')
      setHits([])
    } finally {
      if (requestIdRef.current === requestId) setLoading(false)
    }
  }, [])

  // Reflect the latest mode without restarting the debounce chain.
  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => doSearch(value), 350)
    },
    [doSearch],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (debounceRef.current) clearTimeout(debounceRef.current)
      doSearch(query)
    },
    [query, doSearch],
  )

  const handleModeChange = useCallback(
    (next: SearchMode) => {
      setMode(next)
      modeRef.current = next
      if (searched && query.trim()) {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        doSearch(query)
      }
    },
    [searched, query, doSearch],
  )

  const hasResults = hits.length > 0 || surahs.length > 0 || reference !== null

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      <motion.header variants={fadeIn}>
        <h1 className="text-2xl font-bold text-ink">Search</h1>
        <p className="text-sm text-ink-muted">
          Arabic text, translations, surah names & exact references
        </p>
      </motion.header>

      <motion.form
        variants={fadeIn}
        onSubmit={handleSubmit}
        className="relative transition-shadow duration-300 focus-within:shadow-[var(--shadow-glow)]"
      >
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="e.g. رحمة, mercy, or 2:255"
          className="w-full rounded-2xl border border-line bg-surface py-3.5 pl-12 pr-4 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          aria-label="Search the Quran"
        />
      </motion.form>

      {/* Mode tabs */}
      <motion.div variants={fadeIn} className="flex gap-1.5">
        {MODES.map(({ id, label, sub }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleModeChange(id)}
            className={`flex flex-1 flex-col items-center rounded-xl border px-3 py-2 transition-colors ${
              mode === id
                ? 'border-brand bg-brand/5 text-brand'
                : 'border-line text-ink-muted hover:border-brand/40 hover:text-ink'
            }`}
            aria-pressed={mode === id}
          >
            <span className="text-sm font-semibold">{label}</span>
            <span className="text-[10px] text-ink-faint">{sub}</span>
          </button>
        ))}
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching…
        </div>
      )}

      {error && (
        <div className="card rounded-2xl p-5 text-sm text-red-700 dark:text-red-300" role="alert">
          {error}
        </div>
      )}

      {!loading && searched && query.trim() && !hasResults && !error && (
        <div className="py-12 text-center">
          <p className="text-sm text-ink-muted">No results found for "{query}"</p>
          <div className="mx-auto mt-6 flex max-w-sm items-start gap-2 rounded-xl border border-line p-4 text-left">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
            <p className="text-xs text-ink-muted">
              Zero-AI guarantee: every result is a verbatim verse from the bundled
              canonical dataset or a public Quran API. Nothing is paraphrased or generated.
            </p>
          </div>
        </div>
      )}

      {!loading && hasResults && (
        <motion.div variants={fadeIn} className="space-y-5">
          {/* Exact reference */}
          {reference && (
            <div className="card rounded-2xl border-brand/30 bg-brand/[0.04] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">
                Exact match
              </p>
              <HitCard hit={reference} query={query} toggle={toggle} playing={playing} isCurrentAyah={isCurrentAyah} />
            </div>
          )}

          {/* Surah-name matches */}
          {surahs.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-ink-faint">
                Surah{surahs.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-2">
                {surahs.map((surah) => (
                  <Link
                    key={surah.number}
                    to={`/surah/${surah.number}`}
                    className="card group flex items-center justify-between rounded-2xl p-4 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-xs font-semibold text-ink-faint">
                        {surah.number}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{surah.nameTransliterated}</p>
                        <p className="text-xs text-ink-muted">{surah.nameTranslation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-ink-muted" lang="ar" dir="rtl">
                        {surah.nameArabic}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-ink-faint group-hover:text-brand" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Ayah hits */}
          {hits.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-ink-faint">
                {hits.length} ayah result{hits.length !== 1 ? 's' : ''}
                {matchesProvider ? ' · from provider' : ''}
              </p>
              <div className="space-y-2">
                <motion.div variants={staggerContainer} className="space-y-2">
                  <AnimatePresence initial={false}>
                    {hits.map((hit) => (
                      <motion.div key={hit.ayahKey} variants={fadeUp}>
                        <HitCard
                          hit={hit}
                          query={query}
                          toggle={toggle}
                          playing={playing}
                          isCurrentAyah={isCurrentAyah}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-xl border border-line p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
            <p className="text-xs text-ink-muted">
              Zero-AI guarantee: every result is a verbatim verse from the bundled canonical
              dataset or a public Quran API. Nothing is paraphrased or generated.
            </p>
          </div>
        </motion.div>
      )}

      {!searched && !loading && (
        <motion.div variants={fadeIn} className="relative overflow-hidden rounded-3xl py-12 text-center">
          <GeometricPattern variant="emerald" className="absolute inset-0 mx-auto h-full w-full object-cover" opacity={0.35} />
          <div className="relative">
            <Search className="mx-auto h-10 w-10 text-ink-faint/40" />
            <p className="mt-3 text-sm text-ink-muted">
              Type to search across Arabic text, translations, surah names, or an exact reference.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function HitCard({
  hit,
  query,
  toggle,
  playing,
  isCurrentAyah,
}: {
  hit: RichHit
  query: string
  toggle: (s: number, a: number) => void
  playing: boolean
  isCurrentAyah: (s: number, a: number) => boolean
}) {
  const active = isCurrentAyah(hit.surahNumber, hit.ayahNumber)

  return (
    <Link
      to={`/surah/${hit.surahNumber}?ayah=${hit.ayahNumber}`}
      className="card group relative block rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-gold">
          {hit.surahName} {hit.surahNumber}:{hit.ayahNumber}
        </p>
        <div className="flex items-center gap-1">
          <motion.button
            type="button"
            whileTap={{ scale: 0.86 }}
            onClick={(e) => {
              e.preventDefault()
              toggle(hit.surahNumber, hit.ayahNumber)
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              active
                ? 'bg-brand text-white'
                : 'text-ink-faint hover:bg-brand/10 hover:text-brand'
            }`}
            aria-label={active ? 'Pause' : 'Play'}
          >
            {active && playing ? (
              <EqualizerBars />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </motion.button>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint">
            <BookOpen className="h-4 w-4 group-hover:text-brand" />
          </span>
        </div>
      </div>

      {hit.excerptArabic && (
        <p className="arabic-heading mt-2 text-lg leading-relaxed" lang="ar" dir="rtl">
          <Highlighted text={hit.excerptArabic} query={query} />
        </p>
      )}
      {hit.excerptTranslation && (
        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
          <Highlighted text={hit.excerptTranslation} query={query} />
        </p>
      )}
    </Link>
  )
}
