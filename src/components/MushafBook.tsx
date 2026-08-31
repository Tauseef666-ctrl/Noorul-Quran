import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'
import type { Ayah } from '../types/quran'
import { useAudio } from '../store/audio'

/**
 * Mushaf presentation — a genuine ivory Quran page (or an opened-book spread of
 * two facing pages) set in traditional right-aligned calligraphy with an
 * ornamental gold-sprigged border. Reads right-to-left like a real Mushaf: odd
 * page on the right, even on the left. Only real provider data is rendered;
 * per-ayah playback stays reachable and the currently playing ayah gets a
 * subtle highlight. The quranic text is never animated — only the sheet/frame
 * flips on a page turn.
 */

/** The flattened page-turn transform shared by single pages and spread leaves. */
const pageFlip = {
  enter: (d: 1 | -1) => ({
    rotateY: d * -70,
    opacity: 0.4,
    transformOrigin: d === 1 ? 'left center' : 'right center',
    transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] as const },
  }),
  center: {
    rotateY: 0,
    opacity: 1,
    originX: 0.5,
    transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const },
  },
  exit: (d: 1 | -1) => ({
    rotateY: d * 60,
    opacity: 0,
    transformOrigin: d === 1 ? 'right center' : 'left center',
    transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const },
  }),
}

/** The paper, double gold border, running header and the ayah list itself. */
function PagePaper({ ayahs, pageNumber }: { ayahs: Ayah[]; pageNumber: number }) {
  const audio = useAudio()
  return (
    <div className="relative h-full overflow-hidden bg-[#f4ead2] shadow-[inset_0_0_40px_rgba(90,70,35,0.12)]">
      {/* paper grain / parchment sheen */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 15% 12%, rgba(255,255,255,0.45), transparent 42%), radial-gradient(circle at 85% 86%, rgba(214,190,140,0.22), transparent 48%)',
        }}
      />
      {/* ornamental double border */}
      <div className="pointer-events-none absolute inset-2 rounded-[6px] border border-[#b49b5f]/50" />
      <div className="pointer-events-none absolute inset-[9px] rounded-[4px] border border-[#b49b5f]/25" />

      <div className="relative flex h-full flex-col px-5 py-7 sm:px-7 sm:py-9">
        {/* running page header */}
        <div className="mb-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6b5729]">
          <span>سُورَةٌ</span>
          <span className="num-ltr tabular-nums">ص {pageNumber}</span>
        </div>

        <ol className="space-y-5">
          {ayahs.map((ayah) => {
            const isCurrent = audio.isCurrentAyah(ayah.surahNumber, ayah.ayahNumber)
            const isPlayingHere = isCurrent && audio.playing
            return (
              <li
                key={ayah.key}
                className={`group flex items-baseline justify-between gap-4 rounded-lg px-1 py-1 transition-colors ${
                  isCurrent ? 'bg-[#d9c89a]/40' : 'hover:bg-[#efe3c0]/40'
                }`}
              >
                <div className="flex min-w-0 flex-1 items-baseline gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      audio.isCurrentAyah(ayah.surahNumber, ayah.ayahNumber)
                        ? audio.playing
                          ? audio.pause()
                          : audio.resume()
                        : audio.play(ayah.surahNumber, ayah.ayahNumber)
                    }
                    aria-label={`${isPlayingHere ? 'Pause' : 'Listen to'} Surah ${ayah.surahNumber}, Ayah ${ayah.ayahNumber}`}
                    title={isPlayingHere ? 'Pause' : 'Listen'}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${
                      isPlayingHere
                        ? 'bg-[#0f6b52] text-white'
                        : 'text-[#6b5729] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-[#0f6b52] hover:text-white'
                    }`}
                  >
                    {isPlayingHere ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3 translate-x-px" />
                    )}
                  </button>
                  <Link
                    to={`/surah/${ayah.surahNumber}?ayah=${ayah.ayahNumber}`}
                    className="quran-text flex-1 text-right leading-[1.95] text-[#1e1a10] transition-opacity hover:opacity-80"
                    lang="ar"
                    dir="rtl"
                    translate="no"
                  >
                    {ayah.arabic}
                  </Link>
                </div>
                <span
                  className="shrink-0 rounded-full border border-[#b49b5f]/55 px-2 py-0.5 text-[10px] font-semibold text-[#6b5729] tabular-nums"
                  title={`Surah ${ayah.surahNumber}, Ayah ${ayah.ayahNumber}`}
                >
                  <span className="num-ltr">{ayah.surahNumber}:{ayah.ayahNumber}</span>
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

/**
 * A single, full Quran page — a readable portrait sheet (roughly the proportions
 * of a physical Mushaf page) centred on the surface. Used for the default Read
 * view on every device and for mobile (one page at a time).
 */
export function MushafSinglePage({
  ayahs,
  pageNumber,
  direction,
}: {
  ayahs: Ayah[]
  pageNumber: number
  direction: 1 | -1
}) {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-[780px] select-none"
      style={{ perspective: 2200 }}
      variants={pageFlip}
      custom={direction}
    >
      <div className="rounded-2xl bg-gradient-to-b from-[#7a2f1b] via-[#5c2414] to-[#461a0d] p-2 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] ring-1 ring-black/30 sm:p-3">
        <div className="overflow-hidden rounded-lg">
          <PagePaper ayahs={ayahs} pageNumber={pageNumber} />
        </div>
      </div>
    </motion.div>
  )
}

/**
 * An opened-book Mushaf for full-screen desktop reading: a hardcover, a spine,
 * and two facing pages with a real leaf-flip. The right (odd) page is the
 * canonical one; the left (even) page is its partner.
 */
export function MushafBook({
  right,
  left,
  pageNumberRight,
  pageNumberLeft,
  direction,
}: {
  right: Ayah[]
  left: Ayah[]
  pageNumberRight: number
  pageNumberLeft: number
  direction: 1 | -1
}) {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-5xl select-none"
      style={{ perspective: 2200 }}
      variants={pageFlip}
      custom={direction}
    >
      <div className="rounded-l-2xl rounded-r-2xl bg-gradient-to-b from-[#7a2f1b] via-[#5c2414] to-[#461a0d] p-2 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] ring-1 ring-black/30 sm:p-3">
        <div className="flex overflow-hidden rounded-lg">
          {/* Left (even) page */}
          <PageSurface ayahs={left} pageNumber={pageNumberLeft} side="left" />
          {/* spine */}
          <div className="relative w-6 shrink-0 bg-gradient-to-r from-[#461a0d] via-[#3a1509] to-[#461a0d] sm:w-8">
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#2c0f05]/80" />
          </div>
          {/* Right (odd) page */}
          <PageSurface ayahs={right} pageNumber={pageNumberRight} side="right" />
        </div>
      </div>
    </motion.div>
  )
}

/** A half page within an opened-book spread (spine joins the two halves). */
function PageSurface({
  ayahs,
  pageNumber,
  side,
}: {
  ayahs: Ayah[]
  pageNumber: number
  side: 'right' | 'left'
}) {
  return (
    <div className="relative flex-1">
      <div className={`relative h-full ${side === 'left' ? 'rounded-l-lg' : 'rounded-r-lg'}`}>
        <PagePaper ayahs={ayahs} pageNumber={pageNumber} />
      </div>
    </div>
  )
}
