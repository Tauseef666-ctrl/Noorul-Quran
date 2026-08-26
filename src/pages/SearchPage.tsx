import { useState, useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, BookOpen, Loader2 } from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import type { SearchHit } from '../types/quran'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchHit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setResults([])
      setSearched(false)
      return
    }

    const provider = getActiveProvider()
    if (!provider.search) {
      setError('Search is not available with the current provider.')
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const hits = await provider.search(trimmed, { limit: 30 })
      setResults(hits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => doSearch(value), 400)
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

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      <motion.header variants={fadeIn}>
        <h1 className="text-2xl font-bold text-ink">Search</h1>
        <p className="text-sm text-ink-muted">Search across the Quran</p>
      </motion.header>

      <motion.form variants={fadeIn} onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search Arabic text, translations, or references…"
          className="w-full rounded-2xl border border-line bg-surface py-3.5 pl-12 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          aria-label="Search the Quran"
        />
      </motion.form>

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

      {!loading && !error && searched && results.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-ink-muted">No results found for "{query}"</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <motion.div variants={fadeIn} className="space-y-3">
          <p className="text-xs font-semibold text-ink-faint">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          {results.map((hit) => (
            <Link
              key={hit.ayahKey}
              to={`/surah/${hit.surahNumber}?ayah=${hit.ayahNumber}`}
              className="card group block rounded-2xl p-4 transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gold">
                    {hit.ayahKey}
                  </p>
                  {hit.excerptArabic && (
                    <p className="arabic-heading mt-1 text-lg" lang="ar" dir="rtl">
                      {hit.excerptArabic}
                    </p>
                  )}
                  {hit.excerptTranslation && (
                    <p className="mt-1 text-sm text-ink-muted line-clamp-2">
                      {hit.excerptTranslation}
                    </p>
                  )}
                </div>
                <BookOpen className="ml-3 h-4 w-4 shrink-0 text-ink-faint group-hover:text-brand" />
              </div>
            </Link>
          ))}
        </motion.div>
      )}

      {!searched && !loading && (
        <motion.div variants={fadeIn} className="py-12 text-center">
          <Search className="mx-auto h-10 w-10 text-ink-faint/40" />
          <p className="mt-3 text-sm text-ink-muted">
            Type to search across Arabic text, translations, and surah names
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
