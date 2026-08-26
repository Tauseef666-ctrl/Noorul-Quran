import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import { getTranslationsForAyah } from '../services/quran/alQuranCloudProvider'
import { DEFAULT_TRANSLATION_IDS } from '../services/quran/translationProvider'
import type { JuzDetail } from '../types/quran'
import { useBookmarks } from '../store/bookmarks'
import { useAsyncData } from '../hooks/useAsyncData'

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function JuzReaderPage() {
  const { juzId } = useParams<{ juzId: string }>()
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({})
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks()

  const juzNumber = Number(juzId)

  const isValid = useMemo(
    () => juzId && !isNaN(juzNumber) && juzNumber >= 1 && juzNumber <= 30,
    [juzId, juzNumber],
  )

  const { data: juz, loading, error: dataError } = useAsyncData<JuzDetail>(
    (signal) => getActiveProvider().getJuz(juzNumber, { signal }),
    [juzNumber],
  )

  // Fetch translations in batches once juz data loads
  useEffect(() => {
    if (!juz) return

    const controller = new AbortController()

    const fetchTranslations = async () => {
      const batchSize = 5
      for (let i = 0; i < juz.ayahs.length; i += batchSize) {
        if (controller.signal.aborted) break
        const batch = juz.ayahs.slice(i, i + batchSize)
        const results = await Promise.all(
          batch.map(async (ayah) => {
            try {
              const trans = await getTranslationsForAyah(
                ayah.surahNumber,
                ayah.ayahNumber,
                DEFAULT_TRANSLATION_IDS,
                controller.signal,
              )
              return [ayah.key, trans] as const
            } catch {
              return [ayah.key, {}] as const
            }
          }),
        )
        if (!controller.signal.aborted) {
          setTranslations((prev) => {
            const next = { ...prev }
            for (const [key, trans] of results) {
              next[key] = trans
            }
            return next
          })
        }
      }
    }

    fetchTranslations()
    return () => controller.abort()
  }, [juz])

  const error = !isValid ? 'Invalid juz number.' : dataError

  if (loading) {
    return (
      <div className="space-y-4 py-12">
        <div className="card animate-pulse rounded-2xl p-6">
          <div className="mx-auto h-8 w-32 rounded bg-line" />
          <div className="mx-auto mt-4 h-24 w-full rounded-xl bg-line" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-3 rounded-2xl p-4">
              <div className="h-16 w-full rounded-xl bg-line" />
              <div className="h-4 w-3/4 rounded bg-line" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !juz) {
    return (
      <div className="py-12 text-center">
        <div className="card rounded-2xl p-8" role="alert">
          <p className="text-sm text-red-700 dark:text-red-300">{error || 'Juz not found.'}</p>
          <Link to="/juz" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
            ← Back to Juz
          </Link>
        </div>
      </div>
    )
  }

  const bookmarkId = `juz-${juzNumber}`

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      {/* Juz header */}
      <motion.div variants={fadeIn} className="card rounded-2xl p-6 text-center sm:p-8">
        <div className="flex items-center justify-between">
          <Link
            to={juzNumber > 1 ? `/juz/${juzNumber - 1}` : '/juz'}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-faint hover:bg-brand/10 hover:text-brand"
            aria-label={juzNumber > 1 ? `Previous juz (${juzNumber - 1})` : 'Back to juz list'}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Juz {juzNumber}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {juz.startKey} → {juz.endKey}
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              {juz.ayahs.length} ayahs
            </p>
          </div>
          <Link
            to={juzNumber < 30 ? `/juz/${juzNumber + 1}` : '/juz'}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-faint hover:bg-brand/10 hover:text-brand"
            aria-label={juzNumber < 30 ? `Next juz (${juzNumber + 1})` : 'Back to juz list'}
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="gold-divider mx-auto mt-5 w-40" />

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isBookmarked('ayah', bookmarkId)) {
                removeBookmark('ayah', bookmarkId)
              } else {
                addBookmark({
                  type: 'ayah',
                  id: bookmarkId,
                  surahNumber: juz.ayahs[0]?.surahNumber ?? 1,
                  ayahNumber: juz.ayahs[0]?.ayahNumber ?? 1,
                  label: `Juz ${juzNumber}`,
                })
              }
            }}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
          >
            {isBookmarked('ayah', bookmarkId) ? (
              <BookmarkCheck className="h-3.5 w-3.5 text-gold" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
            Bookmark Juz
          </button>
        </div>
      </motion.div>

      {/* Ayahs */}
      <motion.ul variants={fadeIn} className="space-y-8">
        {juz.ayahs.map((ayah, index) => {
          const prevAyah = index > 0 ? juz.ayahs[index - 1] : null
          const showSurahHeader = !prevAyah || prevAyah.surahNumber !== ayah.surahNumber

          return (
            <motion.li key={ayah.key} variants={fadeIn}>
              {/* Surah header when surah changes */}
              {showSurahHeader && (
                <div className="mb-4 border-b border-line pb-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                    Surah {ayah.surahNumber}
                  </p>
                  <Link
                    to={`/surah/${ayah.surahNumber}`}
                    className="text-sm font-semibold text-brand hover:underline"
                  >
                    Read full surah →
                  </Link>
                </div>
              )}

              <div className="rounded-2xl p-4 sm:p-6 transition-colors hover:bg-surface/60">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-[10px] font-semibold text-ink-faint">
                    {ayah.ayahNumber}
                  </span>
                  <span className="text-[10px] font-semibold text-ink-faint">
                    {ayah.surahNumber}:{ayah.ayahNumber}
                  </span>
                </div>

                <p className="quran-text text-right" lang="ar" dir="rtl">
                  {ayah.arabic}
                </p>

                <div className="mt-3 space-y-2 border-t border-line/50 pt-3">
                  {translations[ayah.key]?.['en.sahih'] && (
                    <p className="translation-en text-[15px] leading-relaxed text-ink-muted">
                      {translations[ayah.key]['en.sahih']}
                    </p>
                  )}
                  {translations[ayah.key]?.['ur.jalandhry'] && (
                    <p className="translation-ur text-right text-base" lang="ur" dir="rtl">
                      {translations[ayah.key]['ur.jalandhry']}
                    </p>
                  )}
                  {!translations[ayah.key] && (
                    <div className="h-4 w-48 animate-pulse rounded bg-line" />
                  )}
                </div>
              </div>
            </motion.li>
          )
        })}
      </motion.ul>

      {/* Bottom nav */}
      <motion.div variants={fadeIn} className="flex items-center justify-between py-6">
        {juzNumber > 1 ? (
          <Link
            to={`/juz/${juzNumber - 1}`}
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Juz
          </Link>
        ) : (
          <div />
        )}
        {juzNumber < 30 ? (
          <Link
            to={`/juz/${juzNumber + 1}`}
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
          >
            Next Juz
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </motion.div>
    </motion.div>
  )
}
