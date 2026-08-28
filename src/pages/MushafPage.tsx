import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  PanelTopOpen,
  X,
  Loader2,
} from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import { MUSHAF_PAGE_COUNT } from '../data/ayahCounts'
import type {
  MushafPage as MushafPageType,
  Ayah,
  MushafLayout,
} from '../types/quran'
import { useAsyncData } from '../hooks/useAsyncData'
import { useReadingProgress } from '../hooks/useReadingProgress'
import { JumpToDialog } from '../components/JumpToDialog'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const LAYOUT_OPTIONS: { id: MushafLayout; label: string; sub: string }[] = [
  { id: 'uthmani', label: 'Uthmani', sub: 'Standard' },
  { id: 'imlaei', label: 'Imla\'i', sub: 'Simple' },
  { id: 'indopak', label: 'IndoPak', sub: '16-line' },
]

const MUSH_LAYOUT_KEY = 'nq:mushaf-layout'
const LAST_PAGE_KEY = 'nq:mushaf-page'

function readLastPage(): number {
  try {
    const raw = localStorage.getItem(LAST_PAGE_KEY)
    const n = Number(raw)
    if (Number.isInteger(n) && n >= 1 && n <= MUSHAF_PAGE_COUNT) return n
  } catch {
    return 1
  }
  return 1
}

function readLayout(): MushafLayout {
  try {
    const stored = localStorage.getItem(MUSH_LAYOUT_KEY)
    if (stored === 'uthmani' || stored === 'imlaei' || stored === 'indopak') {
      return stored
    }
  } catch {
    return 'uthmani'
  }
  return 'uthmani'
}

export default function MushafPageReader() {
  const { page: pageParam } = useParams<{ page: string }>()
  const navigate = useNavigate()
  const [fullscreen, setFullscreen] = useState(false)
  const [jumpOpen, setJumpOpen] = useState(false)
  const [layout, setLayout] = useState<MushafLayout>(readLayout)
  const [lastPage] = useState(readLastPage)
  const [swipe, setSwipe] = useState<{ x: number; y: number } | null>(null)
  const { updateProgress } = useReadingProgress()

  const provider = useMemo(() => getActiveProvider(), [])
  const supportedLayouts = useMemo(
    () => LAYOUT_OPTIONS.filter((option) => provider.supportsMushaf(option.id)),
    [provider],
  )

  const rawPage = pageParam ? Number(pageParam) : lastPage
  const pageNumber = Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= MUSHAF_PAGE_COUNT
    ? rawPage
    : 1

  const { data: mushafPage, loading, error } = useAsyncData<MushafPageType>(
    (signal) => provider.getPage(pageNumber, { signal, mushaf: layout }),
    [pageNumber, provider, layout],
  )

  // Redirect /mushaf → last-saved page
  useEffect(() => {
    if (!pageParam && lastPage !== 1) {
      navigate(`/mushaf/${lastPage}`, { replace: true })
    }
  }, [pageParam, lastPage, navigate])

  // Persist the last-read page locally
  useEffect(() => {
    try {
      localStorage.setItem(LAST_PAGE_KEY, String(pageNumber))
    } catch {
      return
    }
  }, [pageNumber])

  // Persist selected mushaf layout locally
  useEffect(() => {
    try {
      localStorage.setItem(MUSH_LAYOUT_KEY, layout)
    } catch {
      return
    }
  }, [layout])

  // Track reading progress from the first ayah on the page
  useEffect(() => {
    const first = mushafPage?.ayahs[0]
    if (!first) return
    updateProgress({
      surahNumber: first.surahNumber,
      ayahNumber: first.ayahNumber,
      page: pageNumber,
      juz: first.navigation.juz,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mushafPage, pageNumber])

  const goPage = useCallback(
    (n: number) => {
      const clamped = Math.min(Math.max(n, 1), MUSHAF_PAGE_COUNT)
      navigate(`/mushaf/${clamped}`)
    },
    [navigate],
  )

  const handleJump = useCallback(
    (page: number) => {
      setJumpOpen(false)
      goPage(page)
    },
    [goPage],
  )

  const changeLayout = useCallback(
    (next: MushafLayout) => {
      setLayout(next)
    },
    [],
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const dir = document.documentElement.dir === 'rtl' ? -1 : 1
        goPage(pageNumber + (e.key === 'ArrowRight' ? dir : -dir))
      }
      if (e.key === 'f' || e.key === 'F') setFullscreen((prev) => !prev)
      if (e.key === 'g' || e.key === 'G') setJumpOpen((prev) => !prev)
      if (e.key === 'Escape') {
        setFullscreen(false)
        setJumpOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [pageNumber, goPage])

  // Swipe navigation (RTL-aware: swiping toward the previous page = +1 in RTL)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setSwipe({ x: touch.clientX, y: touch.clientY })
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!swipe) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - swipe.x
      const dy = touch.clientY - swipe.y
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return
      const horizontalDirection = dx < 0 ? 1 : -1 // -60px = swipe left
      goPage(pageNumber + horizontalDirection)
    },
    [swipe, goPage, pageNumber],
  )

  const progressPct = (pageNumber / MUSHAF_PAGE_COUNT) * 100

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Fullscreen reading mode */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-paper">
          <div className="flex items-center justify-between p-3">
            <span className="text-xs font-medium text-ink-faint">
              Page {pageNumber} of {MUSHAF_PAGE_COUNT} · {layout}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setJumpOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-brand/10 hover:text-brand"
                aria-label="Jump to page"
              >
                <PanelTopOpen className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-brand/10 hover:text-brand"
                aria-label="Exit fullscreen"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto px-4 py-6 sm:px-10"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {mushafPage ? (
              <ol className="mx-auto max-w-3xl space-y-4">
                {mushafPage.ayahs.map((ayah: Ayah) => (
                  <li key={ayah.key} className="flex items-baseline justify-between gap-4">
                    <span className="quran-text text-right" lang="ar" dir="rtl">
                      {ayah.arabic}
                    </span>
                    <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold text-ink-faint">
                      {ayah.surahNumber}:{ayah.ayahNumber}
                    </span>
                  </li>
                ))}
              </ol>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 py-20 text-sm text-ink-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading page…
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-red-700 dark:text-red-300">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-line p-3">
            <button
              type="button"
              onClick={() => goPage(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-xs text-ink-faint">
              {pageNumber} / {MUSHAF_PAGE_COUNT}
            </span>
            <button
              type="button"
              onClick={() => goPage(pageNumber + 1)}
              disabled={pageNumber >= MUSHAF_PAGE_COUNT}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <motion.div variants={fadeIn} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-ink">Mushaf</h1>
          <p className="text-xs text-ink-muted">Page {pageNumber} of {MUSHAF_PAGE_COUNT}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setJumpOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-brand/10 hover:text-brand"
            aria-label="Jump to page, surah, or juz"
            title="Jump to (G)"
          >
            <PanelTopOpen className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setFullscreen(!fullscreen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-brand/10 hover:text-brand"
            aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title="Fullscreen (F)"
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>

      {/* Reading progress */}
      <motion.div
        variants={fadeIn}
        className="h-1 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={pageNumber}
        aria-valuemin={1}
        aria-valuemax={MUSHAF_PAGE_COUNT}
        aria-label={`${progressPct.toFixed(1)}% of the mushaf`}
      >
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </motion.div>

      {/* Layout selector + page controls */}
      <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
          {supportedLayouts.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => changeLayout(option.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                layout === option.id
                  ? 'bg-brand text-white'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title={option.sub}
              aria-pressed={layout === option.id}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => goPage(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-16 text-center text-sm font-semibold text-ink-muted">
            {pageNumber}
          </span>
          <button
            type="button"
            onClick={() => goPage(pageNumber + 1)}
            disabled={pageNumber >= MUSHAF_PAGE_COUNT}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
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
        <motion.div
          variants={fadeIn}
          className="card rounded-2xl p-6 sm:p-10"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
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
          disabled={pageNumber >= MUSHAF_PAGE_COUNT}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-30"
        >
          Next Page <ChevronRight className="h-4 w-4" />
        </button>
      </motion.div>

      {/* Jump-to dialog */}
      <JumpToDialog
        key={`jump-${jumpOpen}`}
        open={jumpOpen}
        onClose={() => setJumpOpen(false)}
        currentPage={pageNumber}
        onJump={handleJump}
      />

      {/* Unsupported layout notice */}
      {supportedLayouts.length === 0 && (
        <div className="card rounded-2xl p-4 text-center text-sm text-red-700 dark:text-red-300">
          <X className="mx-auto mb-1 h-4 w-4" aria-hidden />
          The active provider does not support any mushaf layout. Switch providers in Settings.
        </div>
      )}
    </motion.div>
  )
}

export function MushafIndex() {
  return <MushafPageReader />
}