import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import type { MushafPage as MushafPageType, Ayah } from '../types/quran'
import { useAsyncData } from '../hooks/useAsyncData'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function MushafPageReader() {
  const { page: pageParam } = useParams<{ page: string }>()
  const navigate = useNavigate()
  const [fullscreen, setFullscreen] = useState(false)

  const pageNumber = Number(pageParam) || 1

  const { data: mushafPage, loading, error } = useAsyncData<MushafPageType>(
    (signal) => getActiveProvider().getPage(pageNumber, { signal }),
    [pageNumber],
  )

  const goPage = useCallback(
    (n: number) => {
      if (n >= 1 && n <= 604) navigate(`/mushaf/${n}`)
    },
    [navigate],
  )

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const dir = document.documentElement.dir === 'rtl' ? -1 : 1
        goPage(pageNumber + (e.key === 'ArrowRight' ? dir : -dir))
      }
      if (e.key === 'f' || e.key === 'F') {
        setFullscreen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [pageNumber, goPage])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={`space-y-4 ${fullscreen ? 'fixed inset-0 z-50 bg-paper p-4' : ''}`}
    >
      {/* Header */}
      <motion.div variants={fadeIn} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-ink">Mushaf</h1>
          <p className="text-xs text-ink-muted">Page {pageNumber} of 604</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFullscreen(!fullscreen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-brand/10 hover:text-brand"
            aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>

      {/* Page number input */}
      <motion.div variants={fadeIn} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <input
          type="number"
          min={1}
          max={604}
          value={pageNumber}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (v >= 1 && v <= 604) goPage(v)
          }}
          className="w-20 rounded-xl border border-line bg-surface py-2 text-center text-sm text-ink focus:border-brand focus:outline-none"
          aria-label="Page number"
        />
        <button
          type="button"
          onClick={() => goPage(pageNumber + 1)}
          disabled={pageNumber >= 604}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </motion.div>

      {/* Page content */}
      {loading ? (
        <div className="card animate-pulse rounded-2xl p-8">
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 w-full rounded bg-line" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="card rounded-2xl p-8 text-center" role="alert">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <Link to="/mushaf/1" className="mt-3 inline-block text-xs font-semibold text-brand hover:underline">
            Go to Page 1
          </Link>
        </div>
      ) : mushafPage ? (
        <motion.div variants={fadeIn} className="card rounded-2xl p-6 sm:p-10">
          <ol className="space-y-4">
            {mushafPage.ayahs.map((ayah: Ayah) => (
              <li key={ayah.key} className="flex items-baseline justify-between gap-4">
                <Link
                  to={`/surah/${ayah.surahNumber}?ayah=${ayah.ayahNumber}`}
                  className="quran-text text-right hover:opacity-80 transition-opacity"
                  lang="ar"
                  dir="rtl"
                >
                  {ayah.arabic}
                </Link>
                <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold text-ink-faint">
                  {ayah.surahNumber}:{ayah.ayahNumber}
                </span>
              </li>
            ))}
          </ol>
        </motion.div>
      ) : null}

      {/* Bottom nav */}
      <motion.div variants={fadeIn} className="flex items-center justify-between py-4">
        <button
          type="button"
          onClick={() => goPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Previous Page
        </button>
        <button
          type="button"
          onClick={() => goPage(pageNumber + 1)}
          disabled={pageNumber >= 604}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-30"
        >
          Next Page <ChevronRight className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  )
}

export function MushafIndex() {
  return <MushafPageReader />
}
