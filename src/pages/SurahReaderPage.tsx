import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  Share2,
  ChevronLeft,
  ChevronRight,
  Info,
  Play,
  Pause,
  RotateCcw,
  BookMarked,
  StickyNote,
} from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import { getTranslationsForAyah } from '../services/quran/alQuranCloudProvider'
import type { SurahDetail, Ayah } from '../types/quran'
import { useBookmarks } from '../store/bookmarks'
import { useTranslations } from '../store/translations'
import { useReadingProgress } from '../hooks/useReadingProgress'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAudio } from '../store/audio'
import { useNotes } from '../store/notes'
import { TafsirModal } from '../components/TafsirModal'
import { VerseInfoPanel } from '../components/VerseInfoPanel'
import { NoteModal } from '../components/NoteModal'
import { LoadingScreen } from '../components/LoadingScreen'
import { EqualizerBars } from '../components/EqualizerBars'
import { AyahTranslations } from '../components/AyahTranslations'

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function AyahActions({
  ayah,
  isBookmarked,
  onBookmark,
  onTafsir,
  onVerseInfo,
  showVerseInfo,
  onNote,
  hasNote,
}: {
  ayah: Ayah
  isBookmarked: boolean
  onBookmark: () => void
  onTafsir: () => void
  onVerseInfo: () => void
  showVerseInfo: boolean
  onNote: () => void
  hasNote: boolean
}) {
  const [copied, setCopied] = useState(false)
  const { toggle, playing, isCurrentAyah } = useAudio()
  const isActive = isCurrentAyah(ayah.surahNumber, ayah.ayahNumber)
  const isPlaying = isActive && playing

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(ayah.arabic).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [ayah.arabic])

  const handleShare = useCallback(() => {
    const text = `${ayah.arabic}\n\n— Surah ${ayah.surahNumber}:${ayah.ayahNumber}`
    if (navigator.share) {
      navigator.share({ text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text)
    }
  }, [ayah])

  return (
    <div className="flex items-center gap-1.5">
      {/* Play / Pause */}
      <button
        type="button"
        onClick={() => toggle(ayah.surahNumber, ayah.ayahNumber)}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          isActive
            ? 'bg-brand text-white shadow-md'
            : 'text-ink-faint hover:bg-brand/10 hover:text-brand'
        }`}
        aria-label={isPlaying ? `Pause ayah ${ayah.ayahNumber}` : `Play ayah ${ayah.ayahNumber}`}
      >
        {isPlaying ? (
          <EqualizerBars />
        ) : isActive ? (
          <RotateCcw className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </button>

      {/* Bookmark — small scale-pop feedback */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.86 }}
        onClick={onBookmark}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand"
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this ayah'}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark this ayah'}
      >
        <motion.span
          key={isBookmarked ? 'on' : 'off'}
          initial={{ scale: 0.5, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className="flex"
          aria-hidden
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-gold" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </motion.span>
      </motion.button>

      {/* Copy */}
      <button
        type="button"
        onClick={handleCopy}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand"
        aria-label="Copy Arabic text"
        title={copied ? 'Copied!' : 'Copy'}
      >
        <Copy className="h-4 w-4" />
      </button>

      {/* Share */}
      <button
        type="button"
        onClick={handleShare}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand"
        aria-label="Share this ayah"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {/* Tafsir */}
      <button
        type="button"
        onClick={onTafsir}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand"
        aria-label={`Tafsir for ayah ${ayah.ayahNumber}`}
        title="Tafsir"
      >
        <BookMarked className="h-4 w-4" />
      </button>

      {/* Verse info */}
      <button
        type="button"
        onClick={onVerseInfo}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          showVerseInfo
            ? 'bg-brand/10 text-brand'
            : 'text-ink-faint hover:bg-brand/10 hover:text-brand'
        }`}
        aria-label={`Verse info for ayah ${ayah.ayahNumber}`}
        title="Verse info"
      >
        <Info className="h-4 w-4" />
      </button>

      {/* Personal note */}
      <button
        type="button"
        onClick={onNote}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          hasNote
            ? 'bg-gold/10 text-gold'
            : 'text-ink-faint hover:bg-gold/10 hover:text-gold'
        }`}
        aria-label={
          hasNote ? `Edit personal note for ayah ${ayah.ayahNumber}` : `Add a personal note for ayah ${ayah.ayahNumber}`
        }
        title={hasNote ? 'Edit personal note' : 'Add personal note'}
      >
        <StickyNote className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function SurahReaderPage() {
  const { surahId } = useParams<{ surahId: string }>()
  const [searchParams] = useSearchParams()
  const targetAyah = searchParams.get('ayah')
  const [showInfo, setShowInfo] = useState(false)
  const [tafsirAyah, setTafsirAyah] = useState<Ayah | null>(null)
  const [verseInfoAyah, setVerseInfoAyah] = useState<Ayah | null>(null)
  const [noteAyah, setNoteAyah] = useState<Ayah | null>(null)
  const ayahRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const { currentAyah, playing, isCurrentAyah, mode, playSurah, pause, resume } = useAudio()
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks()
  const { activeIds, activeEditions } = useTranslations()
  const { updateProgress } = useReadingProgress()
  const notes = useNotes()

  const surahNumber = Number(surahId)

  const isValid = useMemo(
    () => surahId && !isNaN(surahNumber) && surahNumber >= 1 && surahNumber <= 114,
    [surahId, surahNumber],
  )

  const { data: surah, loading, error: dataError } = useAsyncData<SurahDetail>(
    (signal) => getActiveProvider().getSurah(surahNumber, { signal }),
    [surahNumber],
  )

  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({})

  // Fetch translations in batches once surah data loads
  useEffect(() => {
    if (!surah) return

    // Update reading progress
    updateProgress({
      surahNumber,
      ayahNumber: 1,
      page: surah.ayahs[0]?.navigation.page ?? 1,
      juz: surah.ayahs[0]?.navigation.juz ?? 1,
    })

    const controller = new AbortController()

    const fetchTranslations = async () => {
      const batchSize = 5
      for (let i = 0; i < surah.ayahs.length; i += batchSize) {
        if (controller.signal.aborted) break
        const batch = surah.ayahs.slice(i, i + batchSize)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surah, activeIds])

  // Scroll to target ayah
  useEffect(() => {
    if (!targetAyah || !surah) return
    const el = ayahRefs.current.get(`${surahNumber}:${targetAyah}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAyah, surah])

  // Track reading on scroll
  useEffect(() => {
    if (!surah) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute('data-ayah-key')
            if (key) {
              const [s, a] = key.split(':').map(Number)
              const ayah = surah.ayahs.find((ay) => ay.surahNumber === s && ay.ayahNumber === a)
              if (ayah) {
                updateProgress({
                  surahNumber: s,
                  ayahNumber: a,
                  page: ayah.navigation.page,
                  juz: ayah.navigation.juz,
                })
              }
            }
          }
        }
      },
      { threshold: 0.5 },
    )

    for (const el of ayahRefs.current.values()) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surah])

  // Scroll current ayah into view during playback
  useEffect(() => {
    if (!currentAyah || !playing) return
    const el = ayahRefs.current.get(`${currentAyah.surahNumber}:${currentAyah.ayahNumber}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentAyah, playing])

  const handleBookmarkToggle = useCallback(() => {
    if (!surah) return
    const id = String(surah.number)
    if (isBookmarked('surah', id)) {
      removeBookmark('surah', id)
    } else {
      addBookmark({
        type: 'surah',
        id,
        surahNumber: surah.number,
        label: surah.nameTransliterated,
      })
    }
  }, [surah, isBookmarked, addBookmark, removeBookmark])

  const error = !isValid ? 'Invalid surah number.' : dataError

  if (loading) {
    return <LoadingScreen />
  }

  if (error || !surah) {
    return (
      <div className="py-12 text-center">
        <div className="card rounded-2xl p-8" role="alert">
          <p className="text-sm text-red-700 dark:text-red-300">{error || 'Surah not found.'}</p>
          <Link to="/surahs" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
            ← Back to Surahs
          </Link>
        </div>
      </div>
    )
  }

  // Bismillah: show for all surahs except 1 (Al-Fatihah — it's part of the text) and 9 (At-Tawbah)
  const showBismillah = surahNumber !== 1 && surahNumber !== 9

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      {/* Surah header */}
      <motion.div variants={fadeIn} className="card rounded-2xl p-6 text-center sm:p-8">
        <div className="flex items-center justify-between">
          <Link
            to={surahNumber > 1 ? `/surah/${surahNumber - 1}` : '/surahs'}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-faint hover:bg-brand/10 hover:text-brand"
            aria-label={surahNumber > 1 ? `Previous surah (${surahNumber - 1})` : 'Back to surahs'}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Surah {surah.number} · {surah.revelationType}
            </p>
            <h1 className="arabic-heading mt-2 text-4xl sm:text-5xl" lang="ar" dir="rtl">
              {surah.nameArabic}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {surah.nameTransliterated} — {surah.nameTranslation}
              {surah.nameTranslationUrdu ? ` · ${surah.nameTranslationUrdu}` : ''}
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              {surah.numberOfAyahs} Ayahs
            </p>
          </div>
          <Link
            to={surahNumber < 114 ? `/surah/${surahNumber + 1}` : '/surahs'}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-faint hover:bg-brand/10 hover:text-brand"
            aria-label={surahNumber < 114 ? `Next surah (${surahNumber + 1})` : 'Back to surahs'}
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="gold-divider mx-auto mt-5 w-40" />

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              const playingThisSurah = mode === 'surah' && currentAyah?.surahNumber === surahNumber
              if (playingThisSurah) {
                if (playing) pause()
                else resume()
              } else {
                playSurah(surahNumber)
              }
            }}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-md transition-colors ${
              mode === 'surah' && currentAyah?.surahNumber === surahNumber
                ? 'bg-gold hover:bg-gold-bright'
                : 'bg-brand hover:bg-brand-deep'
            }`}
            aria-label={
              mode === 'surah' && currentAyah?.surahNumber === surahNumber && playing
                ? `Pause surah ${surahNumber}`
                : `Play surah ${surahNumber}`
            }
          >
            {mode === 'surah' && currentAyah?.surahNumber === surahNumber && playing ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {mode === 'surah' && currentAyah?.surahNumber === surahNumber ? 'Pause Surah' : 'Play Surah'}
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={handleBookmarkToggle}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
            aria-pressed={isBookmarked('surah', String(surah.number))}
          >
            <motion.span
              key={isBookmarked('surah', String(surah.number)) ? 'on' : 'off'}
              initial={{ scale: 0.6, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="flex"
              aria-hidden
            >
              {isBookmarked('surah', String(surah.number)) ? (
                <BookmarkCheck className="h-3.5 w-3.5 text-gold" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
            </motion.span>
            Bookmark Surah
          </motion.button>
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
          >
            <Info className="h-3.5 w-3.5" />
            {showInfo ? 'Hide Info' : 'Surah Info'}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-ink-faint tabular-nums">
          Translation{activeEditions.length !== 1 ? 's' : ''}:{' '}
          {activeEditions.map((e) => e.translator).join(' · ')}
        </p>

        {showInfo && (
          <div className="mt-4 rounded-xl bg-brand/5 p-4 text-left text-sm text-ink-muted">
            <p><span className="font-semibold text-ink">Name:</span> {surah.nameTransliterated}</p>
            <p><span className="font-semibold text-ink">Meaning:</span> {surah.nameTranslation}</p>
            {surah.nameTranslationUrdu && (
              <p><span className="font-semibold text-ink">Urdu:</span> {surah.nameTranslationUrdu}</p>
            )}
            <p><span className="font-semibold text-ink">Revelation:</span> {surah.revelationType}</p>
            <p><span className="font-semibold text-ink">Ayahs:</span> {surah.numberOfAyahs}</p>
            <p>
              <span className="font-semibold text-ink">Starting page:</span>{' '}
              {surah.ayahs[0]?.navigation.page ?? '—'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Bismillah */}
      {showBismillah && (
        <motion.div variants={fadeIn} className="text-center py-2">
          <p className="arabic-heading text-2xl text-ink" lang="ar" dir="rtl">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="mt-1 text-xs text-ink-faint italic">
            In the name of Allah, the Most Gracious, the Most Merciful
          </p>
        </motion.div>
      )}

      {/* Ayahs */}
      <motion.ul variants={fadeIn} className="space-y-8">
        {surah.ayahs.map((ayah) => {
          const bookmarkId = `${ayah.surahNumber}:${ayah.ayahNumber}`
          const note = notes.getNote(ayah.surahNumber, ayah.ayahNumber)
          const isActive = isCurrentAyah(ayah.surahNumber, ayah.ayahNumber) && playing
          return (
            <motion.li
              key={ayah.key}
              ref={(el) => {
                if (el) ayahRefs.current.set(ayah.key, el)
              }}
              data-ayah-key={ayah.key}
              variants={fadeIn}
              className={`group relative rounded-2xl p-4 transition-[background-color,box-shadow] sm:p-6 ${
                isActive
                  ? 'bg-brand/5 shadow-[var(--shadow-glow)] ring-1 ring-brand/25'
                  : 'hover:bg-surface/60 hover:shadow-[var(--shadow-glow)]'
              }`}
            >
              {/* Ayah number badge */}
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-[11px] font-semibold text-ink-faint">
                  {ayah.ayahNumber}
                </span>
                <AyahActions
                  ayah={ayah}
                  isBookmarked={isBookmarked('ayah', bookmarkId)}
                  onBookmark={() => {
                    if (isBookmarked('ayah', bookmarkId)) {
                      removeBookmark('ayah', bookmarkId)
                    } else {
                      addBookmark({
                        type: 'ayah',
                        id: bookmarkId,
                        surahNumber: ayah.surahNumber,
                        ayahNumber: ayah.ayahNumber,
                        label: `${surah.nameTransliterated} ${ayah.surahNumber}:${ayah.ayahNumber}`,
                      })
                    }
                  }}
                  onTafsir={() => setTafsirAyah(ayah)}
                  onVerseInfo={() =>
                    setVerseInfoAyah((prev) =>
                      prev?.key === ayah.key ? null : ayah,
                    )
                  }
                  showVerseInfo={verseInfoAyah?.key === ayah.key}
                  onNote={() => setNoteAyah(ayah)}
                  hasNote={Boolean(note)}
                />

                {/* Verse info panel */}
                {verseInfoAyah?.key === ayah.key && (
                  <VerseInfoPanel
                    ayah={ayah}
                    isOpen
                    onClose={() => setVerseInfoAyah(null)}
                  />
                )}
              </div>

              {/* Arabic text */}
              <p className="quran-text text-right" lang="ar" dir="rtl">
                {ayah.arabic}
              </p>

              {/* Translations */}
              <div className="mt-4 border-t border-line/50 pt-3">
                <AyahTranslations
                  textByEdition={translations[ayah.key] ?? {}}
                  editions={activeEditions}
                  hasData={Boolean(translations[ayah.key])}
                />
              </div>

              {/* Personal note */}
              {note && (
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
                    {note.text}
                  </p>
                </div>
              )}

              {/* Page marker */}
              {ayah.ayahNumber === 1 || ayah.navigation.page !== surah.ayahs[surah.ayahs.indexOf(ayah) - 1]?.navigation.page ? (
                <div className="absolute -right-2 top-4 hidden rotate-90 text-[10px] font-semibold text-ink-faint sm:block">
                  p.{ayah.navigation.page}
                </div>
              ) : null}
            </motion.li>
          )
        })}
      </motion.ul>

      {/* Bottom navigation */}
      <motion.div variants={fadeIn} className="flex items-center justify-between py-6">
        {surahNumber > 1 ? (
          <Link
            to={`/surah/${surahNumber - 1}`}
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Surah
          </Link>
        ) : (
          <div />
        )}
        {surahNumber < 114 ? (
          <Link
            to={`/surah/${surahNumber + 1}`}
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
          >
            Next Surah
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
