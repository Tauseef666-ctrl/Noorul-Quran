import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface AyahNote {
  key: string
  surahNumber: number
  ayahNumber: number
  text: string
  updatedAt: number
}

export const NOTE_SYNC_LABEL =
  'Notes are stored privately on this device. Cloud sync across devices will be available later through authenticated user accounts.'

const STORAGE_KEY = 'nq:notes'

function noteKey(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}:${ayahNumber}`
}

function loadNotes(): AyahNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AyahNote[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistNotes(notes: AyahNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    return
  }
}

interface NotesContextValue {
  notes: AyahNote[]
  getNote: (surahNumber: number, ayahNumber: number) => AyahNote | undefined
  upsertNote: (surahNumber: number, ayahNumber: number, text: string) => void
  deleteNote: (surahNumber: number, ayahNumber: number) => void
}

const NotesContext = createContext<NotesContextValue | null>(null)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<AyahNote[]>(loadNotes)

  useEffect(() => {
    persistNotes(notes)
  }, [notes])

  const getNote = useCallback(
    (surahNumber: number, ayahNumber: number) =>
      notes.find((n) => n.key === noteKey(surahNumber, ayahNumber)),
    [notes],
  )

  const upsertNote = useCallback((surahNumber: number, ayahNumber: number, text: string) => {
    const trimmed = text.trim()
    const key = noteKey(surahNumber, ayahNumber)
    setNotes((prev) => {
      const existing = prev.find((n) => n.key === key)
      if (!trimmed) return prev
      if (existing) {
        return prev.map((n) =>
          n.key === key ? { ...n, text: trimmed, updatedAt: Date.now() } : n,
        )
      }
      return [...prev, { key, surahNumber, ayahNumber, text: trimmed, updatedAt: Date.now() }]
    })
  }, [])

  const deleteNote = useCallback((surahNumber: number, ayahNumber: number) => {
    const key = noteKey(surahNumber, ayahNumber)
    setNotes((prev) => prev.filter((n) => n.key !== key))
  }, [])

  const value = useMemo<NotesContextValue>(
    () => ({ notes, getNote, upsertNote, deleteNote }),
    [notes, getNote, upsertNote, deleteNote],
  )

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used within a NotesProvider')
  return ctx
}