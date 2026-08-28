import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, BookMarked } from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import { useAsyncData } from '../hooks/useAsyncData'
import type { TafsirContent } from '../types/quran'

interface TafsirModalProps {
  surahNumber: number
  ayahNumber: number
  isOpen: boolean
  onClose: () => void
}

export function TafsirModal({ surahNumber, ayahNumber, isOpen, onClose }: TafsirModalProps) {
  const providerTafsir = getActiveProvider().getTafsir

  const { data, loading, error } = useAsyncData<TafsirContent>(
    (signal) =>
      providerTafsir
        ? providerTafsir(surahNumber, ayahNumber, 'en.jalalayn', { signal })
        : Promise.reject(new Error('Tafsir not available with the current provider.')),
    [providerTafsir, surahNumber, ayahNumber],
    isOpen && !!providerTafsir,
  )

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

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
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg overflow-hidden rounded-2xl border border-line bg-surface-opaque shadow-xl sm:inset-x-auto"
            role="dialog"
            aria-modal="true"
            aria-label={`Tafsir for ${surahNumber}:${ayahNumber}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-gold" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-ink">Tafsir</p>
                  <p className="text-xs text-ink-faint">
                    {surahNumber}:{ayahNumber}
                    {data?.name ? ` · ${data.name}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-brand/10 hover:text-ink"
                aria-label="Close tafsir"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              {!providerTafsir && (
                <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                  Tafsir is not available with the current provider. Try again from the Quran
                  Foundation provider.
                </div>
              )}

              {providerTafsir && loading && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading tafsir…
                </div>
              )}

              {providerTafsir && error && !loading && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              )}

              {providerTafsir && data && !loading && (
                <>
                  <p className="text-sm leading-relaxed text-ink-muted">{data.text}</p>
                  <div className="mt-4 border-t border-line pt-3 text-center">
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