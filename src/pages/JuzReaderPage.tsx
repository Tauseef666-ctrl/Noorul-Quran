import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  BookMarked,
  Info,
  Copy,
  Share2,
  StickyNote,
} from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import { getTranslationsForAyah } from '../services/quran/alQuranCloudProvider'
import type { JuzDetail, Ayah } from '../types/quran'
import { useBookmarks } from '../store/bookmarks'
import { useTranslations } from '../store/translations'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAudio } from '../store/audio'
import { TafsirModal } from '../components/TafsirModal'
import { VerseInfoPanel } from '../components/VerseInfoPanel'
import { NoteModal } from '../components/NoteModal'
import { useNotes } from '../store/notes'
import { LoadingScreen } from '../components/LoadingScreen'
import { EqualizerBars } from '../components/EqualizerBars'
import { AyahTranslations } from '../components/AyahTranslations'

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function JuzReaderPage() {
  const { juzId } = useParams<{ juzId: string }>()
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({})
  const [tafsirAyah, setTafsirAyah] = useState<Ayah | null>(null)
  const [verseInfoAyah, setVerseInfoAyah] = useState<Ayah | null>(null)
  const [noteAyah, setNoteAyah] = useState<Ayah | null>(null)
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks()
  const { activeIds, activeEditions } = useTranslations()
  const { toggle, playing, isCurrentAyah, currentAyah, mode, playRange, pause, resume } = useAudio()
  const notes = useNotes()
  const ayahRefs = useRef<Map<string, HTMLLIElement>>(new Map())

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
                activeIds,
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
  }, [juz, activeIds])

  const error = !isValid ? 'Invalid juz number.' : dataError

  // Scroll current ayah into view during playback
  useEffect(() => {
    if (!currentAyah || !playing) return
    const el = ayahRefs.current.get(`${currentAyah.surahNumber}:${currentAyah.ayahNumber}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentAyah, playing])

  if (loading) {
    return <LoadingScreen label="Loading juz…" />
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
              const playingThisJuz = mode === 'range' && currentAyah?.surahNumber === juz.ayahs[0]?.surahNumber
              if (playingThisJuz) {
                if (playing) pause()
                else resume()
              } else {
                playRange(juz.ayahs.map((a) => ({ surahNumber: a.surahNumber, ayahNumber: a.ayahNumber })))
              }
            }}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-md transition-colors ${
              mode === 'range' && currentAyah?.surahNumber === juz.ayahs[0]?.surahNumber
                ? 'bg-gold hover:bg-gold-bright'
                : 'bg-brand hover:bg-brand-deep'
            }`}
            aria-label="Play this juz"
          >
            {mode === 'range' && playing ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {mode === 'range' && playing ? 'Pause Juz' : 'Play Juz'}
          </button>
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
                  surahNumber: juz.ayahs[0]?.surahNumber ?? 1,
                  ayahNumber: juz.ayahs[0]?.ayahNumber ?? 1,
                  label: `Juz ${juzNumber}`,
                })
              }
            }}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
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
              {isBookmarked('ayah', bookmarkId) ? (
                <BookmarkCheck className="h-3.5 w-3.5 text-gold" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
            </motion.span>
            Bookmark Juz
          </motion.button>
        </div>

        <p className="mt-4 text-center text-[11px] text-ink-faint tabular-nums">
          Translation{activeEditions.length !== 1 ? 's' : ''}:{' '}
          {activeEditions.map((e) => e.translator).join(' · ')}
        </p>
      </motion.div>

      {/* Ayahs */}
      <motion.ul variants={fadeIn} className="space-y-8">
        {juz.ayahs.map((ayah, index) => {
          const prevAyah = index > 0 ? juz.ayahs[index - 1] : null
          const showSurahHeader = !prevAyah || prevAyah.surahNumber !== ayah.surahNumber
          const bookmarkId = `${ayah.surahNumber}:${ayah.ayahNumber}`

          return (
            <motion.li
              key={ayah.key}
              ref={(el) => {
                if (el) ayahRefs.current.set(ayah.key, el)
              }}
              data-ayah-key={ayah.key}
              variants={fadeIn}
            >
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

              <div
                className={`group rounded-2xl p-4 transition-[background-color,box-shadow] sm:p-6 ${
                  isCurrentAyah(ayah.surahNumber, ayah.ayahNumber) && playing
                    ? 'bg-brand/5 shadow-[var(--shadow-glow)] ring-1 ring-brand/25'
                    : 'hover:bg-surface/60 hover:shadow-[var(--shadow-glow)]'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-[10px] font-semibold text-ink-faint">
                    {ayah.ayahNumber}
                  </span>

                  {/* Per-ayah actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggle(ayah.surahNumber, ayah.ayahNumber)}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                        isCurrentAyah(ayah.surahNumber, ayah.ayahNumber)
                          ? 'bg-brand text-white'
                          : 'text-ink-faint hover:bg-brand/10 hover:text-brand'
                      }`}
                      aria-label={isCurrentAyah(ayah.surahNumber, ayah.ayahNumber) && playing ? `Pause ayah ${ayah.ayahNumber}` : `Play ayah ${ayah.ayahNumber}`}
                    >
                      {isCurrentAyah(ayah.surahNumber, ayah.ayahNumber) && playing ? (
                        <EqualizerBars />
                      ) : isCurrentAyah(ayah.surahNumber, ayah.ayahNumber) ? (
                        <RotateCcw className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isBookmarked('ayah', bookmarkId)) {
                          removeBookmark('ayah', bookmarkId)
                        } else {
                          addBookmark({
                            type: 'ayah',
                            id: bookmarkId,
                            surahNumber: ayah.surahNumber,
                            ayahNumber: ayah.ayahNumber,
                            label: `Juz ${juzNumber} · ${ayah.surahNumber}:${ayah.ayahNumber}`,
                          })
                        }
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand"
                      aria-label={isBookmarked('ayah', bookmarkId) ? 'Remove bookmark' : 'Bookmark'}
                    >
                      <motion.span
                        key={isBookmarked('ayah', bookmarkId) ? 'on' : 'off'}
                        initial={{ scale: 0.6, opacity: 0.4 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        className="flex"
                        aria-hidden
                      >
                        {isBookmarked('ayah', bookmarkId) ? (
                          <BookmarkCheck className="h-3.5 w-3.5 text-gold" />
                        ) : (
                          <Bookmark className="h-3.5 w-3.5" />
                        )}
                      </motion.span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(ayah.arabic).catch(() => {})
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand"
                      aria-label="Copy"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `${ayah.arabic}\n\n— ${ayah.surahNumber}:${ayah.ayahNumber}`
                        if (navigator.share) {
                          navigator.share({ text }).catch(() => {})
                        } else {
                          navigator.clipboard.writeText(text)
                        }
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand"
                      aria-label="Share"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTafsirAyah(ayah)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand"
                      aria-label="Tafsir"
                    >
                      <BookMarked className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setVerseInfoAyah((prev) =>
                          prev?.key === ayah.key ? null : ayah,
                        )
                      }
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                        verseInfoAyah?.key === ayah.key
                          ? 'bg-brand/10 text-brand'
                          : 'text-ink-faint hover:bg-brand/10 hover:text-brand'
                      }`}
                      aria-label="Verse info"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteAyah(ayah)}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                        notes.getNote(ayah.surahNumber, ayah.ayahNumber)
                          ? 'bg-gold/10 text-gold'
                          : 'text-ink-faint hover:bg-gold/10 hover:text-gold'
                      }`}
                      aria-label={
                        notes.getNote(ayah.surahNumber, ayah.ayahNumber)
                          ? `Edit personal note for ayah ${ayah.ayahNumber}`
                          : `Add a personal note for ayah ${ayah.ayahNumber}`
                      }
                      title="Personal note"
                    >
                      <StickyNote className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="quran-text text-right" lang="ar" dir="rtl" translate="no">
                  {ayah.arabic}
                </p>

                <div className="mt-3 border-t border-line/50 pt-3">
                  <AyahTranslations
                    textByEdition={translations[ayah.key] ?? {}}
                    editions={activeEditions}
                    hasData={Boolean(translations[ayah.key])}
                  />
                </div>

                {/* Personal note */}
                {notes.getNote(ayah.surahNumber, ayah.ayahNumber) && (
                  <div
                    className="mt-3 rounded-xl border border-gold/30 bg-gold/10 p-4"
                    role="note"
                    aria-label="Personal note"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-gold">
                        <StickyNote className="h-3.5 w-3.5" aria-hidden />
                        Personal Note
                      </p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setNoteAyah(ayah)}
                          className="rounded-md px-2 py-1 text-[11px] font-medium text-gold transition-colors hover:bg-gold/10"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => notes.deleteNote(ayah.surahNumber, ayah.ayahNumber)}
                          className="rounded-md px-2 py-1 text-[11px] font-medium text-ink-faint transition-colors hover:bg-gold/10 hover:text-red-600 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                      {notes.getNote(ayah.surahNumber, ayah.ayahNumber)?.text}
                    </p>
                  </div>
                )}

                {/* Verse info panel */}
                {verseInfoAyah?.key === ayah.key && (
                  <VerseInfoPanel
                    ayah={ayah}
                    isOpen
                    onClose={() => setVerseInfoAyah(null)}
                  />
                )}
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

      {/* Tafsir modal */}
      {tafsirAyah && (
        <TafsirModal
          surahNumber={tafsirAyah.surahNumber}
          ayahNumber={tafsirAyah.ayahNumber}
          isOpen
          onClose={() => setTafsirAyah(null)}
        />
      )}

      {/* Personal note modal */}
      {noteAyah && (
        <NoteModal
          key={noteAyah.key}
          surahNumber={noteAyah.surahNumber}
          ayahNumber={noteAyah.ayahNumber}
          isOpen
          onClose={() => setNoteAyah(null)}
        />
      )}
    </motion.div>
  )
}
