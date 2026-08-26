import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type BookmarkType = 'ayah' | 'surah' | 'page'

export interface Bookmark {
  type: BookmarkType
  id: string
  surahNumber?: number
  ayahNumber?: number
  page?: number
  label?: string
  timestamp: number
}

const STORAGE_KEY = 'nq:bookmarks'

function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Bookmark[]
  } catch {
    return []
  }
}

function persistBookmarks(bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
  } catch {
    return
  }
}

interface BookmarksContextValue {
  bookmarks: Bookmark[]
  addBookmark: (bookmark: Omit<Bookmark, 'timestamp'>) => void
  removeBookmark: (type: BookmarkType, id: string) => void
  isBookmarked: (type: BookmarkType, id: string) => boolean
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks)

  useEffect(() => {
    persistBookmarks(bookmarks)
  }, [bookmarks])

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'timestamp'>) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.type === bookmark.type && b.id === bookmark.id)) return prev
      return [...prev, { ...bookmark, timestamp: Date.now() }]
    })
  }, [])

  const removeBookmark = useCallback((type: BookmarkType, id: string) => {
    setBookmarks((prev) => prev.filter((b) => !(b.type === type && b.id === id)))
  }, [])

  const isBookmarked = useCallback(
    (type: BookmarkType, id: string) => bookmarks.some((b) => b.type === type && b.id === id),
    [bookmarks],
  )

  const value = useMemo(
    () => ({ bookmarks, addBookmark, removeBookmark, isBookmarked }),
    [bookmarks, addBookmark, removeBookmark, isBookmarked],
  )

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>
}

export function useBookmarks(): BookmarksContextValue {
  const ctx = useContext(BookmarksContext)
  if (!ctx) throw new Error('useBookmarks must be used within a BookmarksProvider')
  return ctx
}
