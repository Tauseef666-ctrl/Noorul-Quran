import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Layers, ArrowRight, Loader2 } from 'lucide-react'
import { loadPageIndex } from '../data/pageIndex'
import { useAsyncData } from '../hooks/useAsyncData'

type JumpTab = 'page' | 'surah' | 'juz' | 'ayah'

interface JumpToDialogProps {
  open: boolean
  onClose: () => void
  currentPage: number
  onJump: (page: number) => void
}

const TABS: { id: JumpTab; label: string; icon: typeof BookOpen }[] = [
  { id: 'page', label: 'Page', icon: BookOpen },
  { id: 'surah', label: 'Surah', icon: Layers },
  { id: 'juz', label: 'Juz', icon: Layers },
  { id: 'ayah', label: 'Ayah', icon: ArrowRight },
]

export function JumpToDialog({ open, onClose, currentPage, onJump }: JumpToDialogProps) {
  const [tab, setTab] = useState<JumpTab>('page')
  const [pageInput, setPageInput] = useState(String(currentPage))
  const [surahQuery, setSurahQuery] = useState('')
  const [surahInput, setSurahInput] = useState('2')
  const [ayahInput, setAyahInput] = useState('1')

  const { data: index, loading, error } = useAsyncData(() => loadPageIndex(), [], open)

  const pageCount = index?.pageCount ?? 604

  const filteredSurahs = useMemo(() => {
    if (!index) return []
    const q = surahQuery.trim().toLowerCase()
    if (!q) return index.surahs
    return index.surahs.filter(
      (s) =>
        s.nameTransliterated.toLowerCase().includes(q) ||
        String(s.number) === q,
    )
  }, [index, surahQuery])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const jumpPage = (page: number) => {
    if (page >= 1 && page <= pageCount) onJump(page)
  }

  const handleAyahJump = () => {
    if (!index) return
    const s = Number.parseInt(surahInput, 10)
    const a = Number.parseInt(ayahInput, 10)
    const page = s && a ? index.pageForAyah(s, a) : null
    if (page) jumpPage(page)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[6%] z-50 mx-auto max-w-md overflow-hidden rounded-2xl border border-line bg-surface-opaque shadow-xl sm:inset-x-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Jump to page"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gold" aria-hidden />
                <p className="text-sm font-semibold text-ink">Jump to</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-brand/10 hover:text-ink"
                aria-label="Close jump dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-line px-3 pt-3">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs font-medium transition-colors ${
                    tab === id
                      ? 'border-b-2 border-brand text-brand'
                      : 'text-ink-faint hover:text-ink'
                  }`}
                  aria-pressed={tab === id}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto p-5">
              {loading && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              )}

              {index && (
                <>
                  {tab === 'page' && (
                    <div className="space-y-3">
                      <label className="block text-xs font-medium text-ink-muted" htmlFor="jump-page">
                        Go to page (1–{pageCount})
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="jump-page"
                          type="number"
                          min={1}
                          max={pageCount}
                          value={pageInput}
                          onChange={(e) => setPageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') jumpPage(Number(pageInput))
                          }}
                          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => jumpPage(Number(pageInput))}
                          className="shrink-0 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
                        >
                          Go
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[1, 50, 100, 200, 300, 400, 500, 600].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => jumpPage(p)}
                            className="rounded-lg border border-line px-2.5 py-1 text-xs text-ink-muted hover:border-brand hover:text-brand"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {tab === 'surah' && (
                    <div className="space-y-3">
                      <input
                        type="search"
                        value={surahQuery}
                        onChange={(e) => setSurahQuery(e.target.value)}
                        placeholder="Search surah (name or number)…"
                        className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none"
                        aria-label="Search surah"
                      />
                      <ul className="max-h-72 space-y-0.5 overflow-y-auto">
                        {filteredSurahs.slice(0, 50).map((s) => (
                          <li key={s.number}>
                            <button
                              type="button"
                              onClick={() => jumpPage(index.surahFirstPage[s.number - 1])}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-brand/10 ${
                                currentPage === index.surahFirstPage[s.number - 1]
                                  ? 'bg-brand/5'
                                  : ''
                              }`}
                            >
                              <span className="flex items-center gap-2 text-sm text-ink">
                                <span className="w-6 text-right text-xs font-semibold text-ink-faint">
                                  {s.number}
                                </span>
                                {s.nameTransliterated}
                              </span>
                              <span className="text-sm text-ink-muted" lang="ar" dir="rtl">
                                {s.nameArabic}
                              </span>
                            </button>
                          </li>
                        ))}
                        {filteredSurahs.length === 0 && (
                          <li className="py-4 text-center text-sm text-ink-faint">
                            No surahs match “{surahQuery}”.
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {tab === 'juz' && (
                    <div className="grid grid-cols-5 gap-1.5">
                      {index.juzFirstPage.map((page, i) => (
                        <button
                          key={i + 1}
                          type="button"
                          onClick={() => jumpPage(page)}
                          className={`flex flex-col items-center rounded-lg border border-line py-2 transition-colors hover:border-brand hover:text-brand ${
                            currentPage === page ? 'border-brand text-brand' : 'text-ink-muted'
                          }`}
                        >
                          <span className="text-sm font-semibold text-ink">{i + 1}</span>
                          <span className="text-[10px] text-ink-faint">p.{page}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {tab === 'ayah' && (
                    <div className="space-y-3">
                      <p className="text-xs text-ink-muted">
                        Go to the 604-page mushaf page that contains a specific ayah.
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={114}
                          value={surahInput}
                          onChange={(e) => setSurahInput(e.target.value)}
                          className="w-20 rounded-xl border border-line bg-surface px-3 py-2 text-center text-sm text-ink focus:border-brand focus:outline-none"
                          aria-label="Surah number"
                        />
                        <span className="text-sm text-ink-faint">:</span>
                        <input
                          type="number"
                          min={1}
                          value={ayahInput}
                          onChange={(e) => setAyahInput(e.target.value)}
                          className="w-20 rounded-xl border border-line bg-surface px-3 py-2 text-center text-sm text-ink focus:border-brand focus:outline-none"
                          aria-label="Ayah number"
                        />
                        <button
                          type="button"
                          onClick={handleAyahJump}
                          className="shrink-0 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
                        >
                          Go
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}