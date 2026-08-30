import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, BookMarked } from 'lucide-react'
import {
  tafsirProvider,
  readTafsirId,
  persistTafsirId,
  TAFSIR_CATALOG,
} from '../services/quran/tafsirProvider'
import { langDir } from '../services/quran/translationProvider'
import { useAsyncData } from '../hooks/useAsyncData'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { TafsirContent, TafsirEdition } from '../types/quran'

interface TafsirModalProps {
  surahNumber: number
  ayahNumber: number
  isOpen: boolean
  onClose: () => void
}

export function TafsirModal({ surahNumber, ayahNumber, isOpen, onClose }: TafsirModalProps) {
  const [editions, setEditions] = useState<TafsirEdition[]>([])
  const [tafsirId, setTafsirId] = useState(readTafsirId)
  const dialogRef = useRef<HTMLDivElement>(null)

  const { data, loading, error } = useAsyncData<TafsirContent>(
    (signal) => tafsirProvider.tafsirForAyah(surahNumber, ayahNumber, tafsirId, signal),
    [surahNumber, ayahNumber, tafsirId],
    isOpen,
  )

  useFocusTrap(isOpen, dialogRef)

  // Load the available tafsir editions when the modal opens
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    tafsirProvider
      .listTafsirs()
      .then((list) => {
        if (!cancelled && list.length > 0) setEditions(list)
      })
      .catch(() => {
        // the static catalogue is used as the fallback at render time
      })
    return () => {
      cancelled = true
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const editionOptions = editions.length > 0 ? editions : TAFSIR_CATALOG
  const selectedEdition = editionOptions.find((e) => e.id === tafsirId) ?? null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            ref={dialogRef}
            className="fixed inset-x-4 top-[8%] z-50 mx-auto max-w-xl overflow-hidden rounded-2xl border border-line bg-surface-opaque shadow-xl sm:inset-x-auto"
            role="dialog"
            aria-modal="true"
            aria-label={`Tafsir for ${surahNumber}:${ayahNumber}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-gold" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-ink">Tafsir</p>
                  <p className="text-xs text-ink-faint">
                    {surahNumber}:{ayahNumber}
                    {selectedEdition ? ` · ${selectedEdition.name}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-brand/10 hover:text-ink"
                aria-label="Close tafsir"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Edition selector */}
            <div className="border-b border-line px-5 py-3">
              <label
                htmlFor="tafsir-edition"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-faint"
              >
                Commentary edition
              </label>
              <select
                id="tafsir-edition"
                value={tafsirId}
                onChange={(e) => {
                  setTafsirId(e.target.value)
                  persistTafsirId(e.target.value)
                }}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
              >
                {editionOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.translator ?? item.name} · {item.languageName}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              {loading && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading tafsir…
                </div>
              )}

              {error && !loading && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              )}

              {data && !loading && (
                <>
                  <p
                    lang="ar"
                    dir={langDir(data.language)}
                    translate="no"
                    className="translation-ar text-[15px] leading-relaxed text-ink"
                  >
                    {data.text}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-line pt-3 text-center">
                    <p className="text-[10px] text-ink-faint tabular-nums">{data.name}</p>
                    <p className="text-[10px] text-ink-faint italic">
                      This is scholarly tafsir (commentary), not Quranic text.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}