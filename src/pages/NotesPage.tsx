import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { StickyNote, Trash2, CloudOff, Pencil } from 'lucide-react'
import { useNotes, NOTE_SYNC_LABEL } from '../store/notes'
import { NoteModal } from '../components/NoteModal'
import { loadCanonicalDataset } from '../data/canonicalQuran'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.03 } },
}

export default function NotesPage() {
  const { notes, deleteNote } = useNotes()
  const [editing, setEditing] = useState<{ surahNumber: number; ayahNumber: number } | null>(null)
  const [surahNames, setSurahNames] = useState<Record<number, { tr: string; tx: string }>>({})

  useEffect(() => {
    let mounted = true
    loadCanonicalDataset()
      .then((dataset) => {
        if (!mounted) return
        const map: Record<number, { tr: string; tx: string }> = {}
        for (const s of dataset.surahs) {
          map[s.n] = { tr: s.tr, tx: s.tx }
        }
        setSurahNames(map)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => a.surahNumber - b.surahNumber || a.ayahNumber - b.ayahNumber),
    [notes],
  )

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.header variants={fadeIn}>
        <h1 className="text-2xl font-bold text-ink">Personal Notes</h1>
        <p className="text-sm text-ink-muted">
          {notes.length} note{notes.length !== 1 ? 's' : ''} attached to ayahs
        </p>
      </motion.header>

      <motion.div
        variants={fadeIn}
        className="flex items-start gap-2.5 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3"
      >
        <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
        <p className="text-[11px] leading-relaxed text-ink-muted italic">{NOTE_SYNC_LABEL}</p>
      </motion.div>

      {notes.length === 0 && (
        <motion.div variants={fadeIn} className="py-12 text-center">
          <StickyNote className="mx-auto h-10 w-10 text-ink-faint/40" />
          <p className="mt-3 text-sm text-ink-muted">No personal notes yet</p>
          <p className="mt-1 text-xs text-ink-faint">
            Open any ayah in a surah or juz reader and tap the note icon to add a private reflection
          </p>
        </motion.div>
      )}

      <motion.div variants={stagger} className="space-y-2">
        {sortedNotes.map((note) => {
          const name = surahNames[note.surahNumber]
          const title = name
            ? `${name.tr} (${name.tx})`
            : `Surah ${note.surahNumber}`
          return (
            <motion.div key={note.key} variants={fadeIn}>
              <div className="card group flex items-center gap-4 rounded-2xl border border-gold/20 bg-gold/5 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]">
                <Link
                  to={`/surah/${note.surahNumber}?ayah=${note.ayahNumber}`}
                  className="flex min-w-0 flex-1 items-center gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                    <StickyNote className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {title}{' '}
                      <span className="font-normal text-ink-muted">
                        {note.surahNumber}:{note.ayahNumber}
                      </span>
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">{note.text}</p>
                    <p className="mt-1 text-[10px] text-ink-faint">
                      Personal note · {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setEditing({ surahNumber: note.surahNumber, ayahNumber: note.ayahNumber })}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-gold/10 hover:text-gold"
                  aria-label={`Edit note for ${note.surahNumber}:${note.ayahNumber}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteNote(note.surahNumber, note.ayahNumber)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  aria-label={`Delete note for ${note.surahNumber}:${note.ayahNumber}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {editing && (
        <NoteModal
          key={`${editing.surahNumber}:${editing.ayahNumber}`}
          surahNumber={editing.surahNumber}
          ayahNumber={editing.ayahNumber}
          isOpen
          onClose={() => setEditing(null)}
        />
      )}
    </motion.div>
  )
}