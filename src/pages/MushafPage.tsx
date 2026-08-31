import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  PanelTopOpen,
  X,
  Loader2,
  Play,
} from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import { MUSHAF_PAGE_COUNT } from '../data/ayahCounts'
import type {
  MushafPage as MushafPageType,
  MushafLayout,
} from '../types/quran'
import type { QuranProvider } from '../services/quran/quranProvider'
import { useAsyncData } from '../hooks/useAsyncData'
import { useReadingProgress } from '../hooks/useReadingProgress'
import { useAudio } from '../store/audio'
import { JumpToDialog } from '../components/JumpToDialog'
import { ErrorState } from '../components/ErrorState'
import { MushafBook } from '../components/MushafBook'
import { EqualizerBars } from '../components/EqualizerBars'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

/* Spread page-turn: a gentle opacity crossfade that drives the exiting spread
   while MushafBook performs the 3D leaf-flip on the incoming one. Opacity only
   so it never fights or distorts the quranic text. */
const spreadTurn = {
  enter: { opacity: 0, transition: { duration: 0.18 } },
  center: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
  exit: { opacity: 0, transition: { duration: 0.22, ease: 'easeIn' as const } },
}

const focusEnter = {
  hidden: { opacity: 0, scale: 0.985 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.28 } },
  exit: { opacity: 0, scale: 0.985, transition: { duration: 0.22 } },
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

function AudioFocusPill() {
  const { currentAyah, playing, loading, pause, resume } = useAudio()
  if (!currentAyah) return null
  return (
    <div className="absolute bottom-16 left-1/2 z-20 -translate-x-1/2">
      <button
        type="button"
        onClick={() => (playing ? pause() : resume())}
        className="glass-ctl flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-ink transition-transform hover:-translate-y-0.5"
        aria-label={playing ? 'Pause recitation' : 'Resume recitation'}
      >
        {playing ? (
          <EqualizerBars />
        ) : loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Play className="h-3.5 w-3.5" aria-hidden />
        )}
        <span>Surah {currentAyah.surahNumber}:{currentAyah.ayahNumber}</span>
        <span className="text-ink-faint">{playing ? 'Pause' : 'Play'}</span>
      </button>
    </div>
  )
}

export default function MushafPageReader() {
  const { page: pageParam } = useParams<{ page: string }>()
  const navigate = useNavigate()
  const [focus, setFocus] = useState(false)
  const [focusIdle, setFocusIdle] = useState(false)
  const [jumpOpen, setJumpOpen] = useState(false)
  const [layout, setLayout] = useState<MushafLayout>(readLayout)
  const [lastPage] = useState(readLastPage)
  const [swipe, setSwipe] = useState<{ x: number; y: number } | null>(null)
  const [pageDir, setPageDir] = useState<1 | -1>(1)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [cachedPage, setCachedPage] = useState<{
    right: MushafPageType
    left: MushafPageType
  } | null>(null)
  const { updateProgress } = useReadingProgress()

  const [provider, setProvider] = useState<QuranProvider | null>(null)
  useEffect(() => {
    let mounted = true
    getActiveProvider().then((p) => {
      if (mounted) setProvider(p)
    })
    return () => {
      mounted = false
    }
  }, [])
  const supportedLayouts = useMemo(
    () => (provider ? LAYOUT_OPTIONS.filter((option) => provider.supportsMushaf(option.id)) : []),
    [provider],
  )

  const rawPage = pageParam ? Number(pageParam) : lastPage
  const pageNumber = Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= MUSHAF_PAGE_COUNT
    ? rawPage
    : 1

  // Opened-book spread: the right (odd) page is the canonical/URL page; the
  // left (even) page is its facing partner.
  const spreadRight = Math.floor((pageNumber - 1) / 2) * 2 + 1
  const spreadLeft = Math.min(spreadRight + 1, MUSHAF_PAGE_COUNT)

  const { data: spread, loading, error, reload } = useAsyncData<{
    right: MushafPageType
    left: MushafPageType
  }>(
    (signal) => {
      if (!provider) return Promise.reject(new Error('Loading source…'))
      return Promise.all([
        provider.getPage(spreadRight, { signal, mushaf: layout }),
        provider.getPage(spreadLeft, { signal, mushaf: layout }),
      ]).then(([r, l]) => ({ right: r, left: l }))
    },
    [spreadRight, spreadLeft, provider, layout],
    Boolean(provider),
  )

  // Keep the last complete spread in state so the page-turn can animate out of
  // it while the next spread is still loading.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional data mirror for the exit animation
    if (spread) setCachedPage(spread)
  }, [spread])

  const shownSpread = spread ?? (loading ? cachedPage : null)

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

  // Track reading progress from the first ayah on the (right/odd) page
  useEffect(() => {
    const first = spread?.right.ayahs[0]
    if (!first) return
    updateProgress({
      surahNumber: first.surahNumber,
      ayahNumber: first.ayahNumber,
      page: spreadRight,
      juz: first.navigation.juz,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread, spreadRight])

  const goPage = useCallback(
    (n: number) => {
      // A page-turn flips a whole leaf — step the spread by one pair, always
      // landing the requested page as the right (odd) page.
      const odd = Math.floor((n - 1) / 2) * 2 + 1
      const clamped = Math.min(Math.max(odd, 1), MUSHAF_PAGE_COUNT)
      if (clamped !== pageNumber) setPageDir(clamped > pageNumber ? 1 : -1)
      navigate(`/mushaf/${clamped}`)
    },
    [navigate, pageNumber],
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

  // Wakes the focus-mode controls on any pointer/touch/keyboard interaction
  const wakeControls = useCallback(() => {
    setFocusIdle(false)
    if (idleTimer.current) window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => setFocusIdle(true), 2600)
  }, [])

  // Schedule auto-hide of focus controls; user interaction (wakeControls) resets it.
  useEffect(() => {
    if (!focus) return
    const t = window.setTimeout(() => setFocusIdle(true), 2600)
    return () => window.clearTimeout(t)
  }, [focus])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const dir = document.documentElement.dir === 'rtl' ? -1 : 1
        goPage(pageNumber + (e.key === 'ArrowRight' ? dir : -dir))
      }
      if (e.key === 'f' || e.key === 'F') setFocus((prev) => !prev)
      if (e.key === 'g' || e.key === 'G') setJumpOpen((prev) => !prev)
      if (e.key === 'Escape') {
        setFocus(false)
        setJumpOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [pageNumber, goPage])

  // Swipe navigation (RTL-aware) — records travel direction for the page-turn
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
      setPageDir(horizontalDirection)
      goPage(pageNumber + horizontalDirection)
    },
    [swipe, goPage, pageNumber],
  )

  const progressPct = (pageNumber / MUSHAF_PAGE_COUNT) * 100

  const controlsVisible = focus && !focusIdle
  const controlsBar = `flex items-center justify-between transition-opacity duration-300 ${
    controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
  }`

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Focus Reading mode */}
      <AnimatePresence>
        {focus && (
          <motion.div
            key="focus"
            variants={focusEnter}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex flex-col"
            style={{
              background:
                'radial-gradient(1100px 55% at 50% -5%, rgba(6,78,59,0.28), transparent 60%), #050807',
            }}
            onMouseMove={wakeControls}
            onPointerDown={wakeControls}
            onTouchStart={(e) => {
              wakeControls()
              handleTouchStart(e)
            }}
            onTouchEnd={handleTouchEnd}
            role="dialog"
            aria-label="Focus Reading"
          >
            {/* Minimal top controls — auto-hide */}
            <div className={controlsBar}>
              <span className="p-3 text-xs font-medium text-ink-faint">
                Page {pageNumber} of {MUSHAF_PAGE_COUNT} · {layout} · Focus Reading
              </span>
              <div className="flex items-center gap-1 p-2">
                <button
                  type="button"
                  onClick={() => setJumpOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand"
                  aria-label="Jump to page"
                >
                  <PanelTopOpen className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setFocus(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand"
                  aria-label="Exit focus reading"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* The opened book — the single brightest element */}
            <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-10">
              <div className="mx-auto max-w-5xl">
                {shownSpread ? (
                  <AnimatePresence custom={pageDir} initial={false} mode="popLayout">
                    <motion.div
                      key={shownSpread.right.pageNumber}
                      custom={pageDir}
                      variants={spreadTurn}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <MushafBook
                        right={shownSpread.right.ayahs}
                        left={shownSpread.left.ayahs}
                        pageNumberRight={shownSpread.right.pageNumber}
                        pageNumberLeft={shownSpread.left.pageNumber}
                        direction={pageDir}
                      />
                    </motion.div>
                  </AnimatePresence>
                ) : loading ? (
                  <div className="flex items-center justify-center gap-2 py-20 text-sm text-ink-faint">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading page…
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-red-300">{error}</p>
                )}
              </div>
            </div>

            {/* Minimal bottom controls — auto-hide */}
            <div className={`${controlsBar} gap-3 p-3`}>
              <button
                type="button"
                onClick={() => goPage(pageNumber - 1)}
                disabled={pageNumber <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-xs tabular-nums text-ink-faint">
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

            <AudioFocusPill />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeIn} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-ink">Mushaf</h1>
          <p className="text-xs text-ink-muted">
            Pages {spreadRight}–{spreadLeft} of {MUSHAF_PAGE_COUNT}
          </p>
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
            onClick={() => setFocus(!focus)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-brand/10 hover:text-brand"
            aria-label={focus ? 'Exit focus reading' : 'Enter focus reading'}
            title="Focus Reading (F)"
          >
            {focus ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
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

      {/* Opened book page-turn */}
      {shownSpread ? (
        <AnimatePresence custom={pageDir} initial={false} mode="popLayout">
          <motion.div
            key={shownSpread.right.pageNumber}
            custom={pageDir}
            variants={spreadTurn}
            initial="enter"
            animate="center"
            exit="exit"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <MushafBook
              right={shownSpread.right.ayahs}
              left={shownSpread.left.ayahs}
              pageNumberRight={shownSpread.right.pageNumber}
              pageNumberLeft={shownSpread.left.pageNumber}
              direction={pageDir}
            />
          </motion.div>
        </AnimatePresence>
      ) : loading ? (
        <div className="card animate-pulse rounded-2xl p-8">
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 w-full rounded bg-line" />
            ))}
          </div>
        </div>
      ) : error ? (
        <ErrorState
          title="Couldn't load this page"
          message={error}
          onRetry={reload}
          backTo="/mushaf/1"
          backLabel="Go to Page 1"
        />
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