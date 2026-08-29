import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, StickyNote, Trash2, Save } from 'lucide-react'
import { useNotes, NOTE_SYNC_LABEL } from '../store/notes'

interface NoteModalProps {
  surahNumber: number
  ayahNumber: number
  isOpen: boolean
  onClose: () => void
}

export function NoteModal({ surahNumber, ayahNumber, isOpen, onClose }: NoteModalProps) {
  const { getNote, upsertNote, deleteNote } = useNotes()
  const existing = getNote(surahNumber, ayahNumber)
  const [text, setText] = useState(existing?.text ?? '')

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleSave = () => {
    upsertNote(surahNumber, ayahNumber, text)
    onClose()
  }

  const handleDelete = () => {
    deleteNote(surahNumber, ayahNumber)
    onClose()
  }

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
            role="dialog"
            aria-modal="true"
            aria-label={`Personal note for ${surahNumber}:${ayahNumber}`}
            className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-lg overflow-hidden rounded-2xl border border-gold/30 bg-surface-opaque shadow-xl sm:inset-x-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line bg-gold/5 px-5 py-4">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-gold" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-ink">Personal Note</p>
                  <p className="text-xs text-ink-faint">
                    Surah {surahNumber}:{ayahNumber} · private to this device
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-brand/10 hover:text-ink"
                aria-label="Close note"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                autoFocus
                placeholder="Write your personal reflection for this ayah…"
                className="w-full resize-y rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                aria-label="Note text"
              />
              <p className="mt-2 text-[11px] leading-relaxed text-ink-faint italic">
                This is a personal note — not Quranic text, translation, or tafsir. {NOTE_SYNC_LABEL}
              </p>

              <div className="mt-4 flex items-center justify-between">
                {existing ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-line px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-strong"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!text.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}