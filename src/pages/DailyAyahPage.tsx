import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, Share2, Sparkles, Play, Pause } from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import { getTranslationsForAyah } from '../services/quran/alQuranCloudProvider'
import { DEFAULT_TRANSLATION_IDS } from '../services/quran/translationProvider'
import type { Ayah } from '../types/quran'
import { useBookmarks } from '../store/bookmarks'
import { useAudio } from '../store/audio'
import { AYAH_COUNTS } from '../data/ayahCounts'
import { useAsyncData } from '../hooks/useAsyncData'

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function getDailyAyah(): { surahNumber: number; ayahNumber: number } {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  )
  const globalIndex = dayOfYear % 6236
  let accumulated = 0
  for (let i = 0; i < AYAH_COUNTS.length; i++) {
    accumulated += AYAH_COUNTS[i]
    if (globalIndex < accumulated) {
      return { surahNumber: i + 1, ayahNumber: globalIndex - (accumulated - AYAH_COUNTS[i]) + 1 }
    }
  }
  return { surahNumber: 114, ayahNumber: 6 }
}

const daily = getDailyAyah()

export default function DailyAyahPage() {
  const [translation, setTranslation] = useState('')
  const [urduTranslation, setUrduTranslation] = useState('')
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks()
  const { toggle, playing, isCurrentAyah, playSurah } = useAudio()

  const bookmarkId = `${daily.surahNumber}:${daily.ayahNumber}`

  const { data: ayah, loading } = useAsyncData<Ayah>(
    (signal) => getActiveProvider().getAyah(daily.surahNumber, daily.ayahNumber, { signal }),
    [],
  )

  // Fetch translations when ayah loads
  useEffect(() => {
    if (!ayah) return
    const controller = new AbortController()

    getTranslationsForAyah(
      daily.surahNumber,
      daily.ayahNumber,
      DEFAULT_TRANSLATION_IDS,
      controller.signal,
    ).then((trans) => {
      setTranslation(trans['en.sahih'] ?? '')
      setUrduTranslation(trans['ur.jalandhry'] ?? '')
    })

    return () => controller.abort()
  }, [ayah])

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      <motion.header variants={fadeIn}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" aria-hidden />
          <h1 className="text-2xl font-bold text-ink">Daily Ayah</h1>
        </div>
        <p className="text-sm text-ink-muted">A verse to reflect on each day</p>
      </motion.header>

      {loading ? (
        <div className="card animate-pulse rounded-2xl p-8">
          <div className="mx-auto h-32 w-full rounded-xl bg-line" />
          <div className="mx-auto mt-6 h-4 w-3/4 rounded bg-line" />
          <div className="mx-auto mt-2 h-4 w-1/2 rounded bg-line" />
        </div>
      ) : ayah && (
        <motion.div variants={fadeIn} className="card rounded-2xl p-6 sm:p-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              {daily.surahNumber}:{daily.ayahNumber}
            </p>
          </div>

          <p className="quran-text mt-6 text-center" lang="ar" dir="rtl">
            {ayah.arabic}
          </p>

          <div className="gold-divider mx-auto my-6 w-32" />

          {translation && (
            <p className="translation-en text-center text-[15px] leading-relaxed text-ink-muted">
              {translation}
            </p>
          )}
          {urduTranslation && (
            <p className="translation-ur mt-3 text-center text-base" lang="ur" dir="rtl">
              {urduTranslation}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => toggle(daily.surahNumber, daily.ayahNumber)}
              className={`inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-deep ${
                isCurrentAyah(daily.surahNumber, daily.ayahNumber) ? 'bg-gold hover:bg-gold-bright' : ''
              }`}
              aria-label={
                isCurrentAyah(daily.surahNumber, daily.ayahNumber) && playing
                  ? 'Pause this ayah'
                  : 'Play this ayah'
              }
            >
              {isCurrentAyah(daily.surahNumber, daily.ayahNumber) && playing ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isCurrentAyah(daily.surahNumber, daily.ayahNumber) && playing
                ? 'Pause'
                : 'Listen'}
            </button>
            <button
              type="button"
              onClick={() => playSurah(daily.surahNumber)}
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
            >
              <Play className="h-4 w-4" />
              Play Surah
            </button>
            <Link
              to={`/surah/${daily.surahNumber}?ayah=${daily.ayahNumber}`}
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
            >
              Read in Context
            </Link>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (isBookmarked('ayah', bookmarkId)) {
                  removeBookmark('ayah', bookmarkId)
                } else {
                  addBookmark({
                    type: 'ayah',
                    id: bookmarkId,
                    surahNumber: daily.surahNumber,
                    ayahNumber: daily.ayahNumber,
                    label: `Daily Ayah ${daily.surahNumber}:${daily.ayahNumber}`,
                  })
                }
              }}
              className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
              aria-pressed={isBookmarked('ayah', bookmarkId)}
            >
              <motion.span
                key={isBookmarked('ayah', bookmarkId) ? 'on' : 'off'}
                initial={{ scale: 0.6, opacity: 0.4 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="flex"
                aria-hidden
              >
                <Bookmark className="h-4 w-4" />
              </motion.span>
              {isBookmarked('ayah', bookmarkId) ? 'Bookmarked' : 'Bookmark'}
            </motion.button>
            <button
              type="button"
              onClick={() => {
                const text = `${ayah.arabic}\n\n— Quran ${daily.surahNumber}:${daily.ayahNumber}`
                if (navigator.share) {
                  navigator.share({ text }).catch(() => {})
                } else {
                  navigator.clipboard.writeText(text)
                }
              }}
              className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
