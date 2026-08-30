import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, Trash2, BookOpen, FileText, Map } from 'lucide-react'
import { useBookmarks, type Bookmark as BookmarkEntry } from '../store/bookmarks'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.03 } },
}

function getBookmarkLink(b: BookmarkEntry): string {
  switch (b.type) {
    case 'surah':
      return `/surah/${b.surahNumber}`
    case 'ayah':
      return `/surah/${b.surahNumber}?ayah=${b.ayahNumber}`
    case 'page':
      return `/mushaf/${b.page}`
    default:
      return '/'
  }
}

function getTypeIcon(type: BookmarkEntry['type']) {
  switch (type) {
    case 'surah':
      return BookOpen
    case 'ayah':
      return FileText
    case 'page':
      return Map
  }
}

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks()

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.header variants={fadeIn}>
        <h1 className="text-2xl font-bold text-ink">Bookmarks</h1>
        <p className="text-sm text-ink-muted">
          {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
        </p>
      </motion.header>

      {bookmarks.length === 0 && (
        <motion.div variants={fadeIn} className="py-12 text-center">
          <Bookmark className="mx-auto h-10 w-10 text-ink-faint/40" />
          <p className="mt-3 text-sm text-ink-muted">No bookmarks yet</p>
          <p className="mt-1 text-xs text-ink-faint">
            Bookmark surahs, ayahs, or pages for quick access
          </p>
        </motion.div>
      )}

      <motion.div variants={stagger} className="space-y-2">
        {bookmarks.map((b) => {
          const Icon = getTypeIcon(b.type)
          return (
            <motion.div key={`${b.type}-${b.id}`} variants={fadeIn}>
              <div className="card group flex items-center gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]">
                <Link to={getBookmarkLink(b)} className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate">
                      {b.label ?? `${b.type} ${b.id}`}
                    </p>
                    <p className="text-xs text-ink-faint capitalize">{b.type}</p>
                  </div>
                </Link>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.86 }}
                  onClick={() => removeBookmark(b.type, b.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  aria-label={`Remove bookmark ${b.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
