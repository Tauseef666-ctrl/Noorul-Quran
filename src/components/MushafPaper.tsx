import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'
import type { Ayah } from '../types/quran'
import { useAudio } from '../store/audio'

/**
 * A genuine-feeling Mushaf page: a warm ivory paper sheet framed by a refined
 * ornamental gold border, with the page's real quranic text set in traditional
 * right-aligned calligraphy. The paper sits distinct from the dark glass app
 * around it. Only real provider data is rendered — never a fake page.
 *
 * Every ayah keeps an accessible playback control; the currently-playing ayah
 * gets a subtle, respectful highlight (the text itself is never animated).
 */
export function MushafPaper({ ayahs, pageNumber }: { ayahs: Ayah[]; pageNumber: number }) {
  const audio = useAudio()

  return (
    <div className="relative">
      {/* Paper surface */}
      <div className="relative overflow-hidden rounded-xl bg-[#f4ead2] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/10">
        {/* subtle paper grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.5), transparent 45%), radial-gradient(circle at 85% 80%, rgba(214,190,140,0.25), transparent 50%)',
          }}
        />
        {/* Ornamental inner border */}
        <div className="pointer-events-none absolute inset-2 rounded-lg border border-[#b49b5f]/60" />
        <div className="pointer-events-none absolute inset-3 rounded-lg border border-[#b49b5f]/35" />

        <div className="relative px-5 py-8 sm:px-8 sm:py-12">
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
                    {/* Per-ayah listen action — subtle until hover/current */}
                    <button
                      type="button"
                      onClick={() =>
                        audio.isCurrentAyah(ayah.surahNumber, ayah.ayahNumber)
                          ? (audio.playing ? audio.pause() : audio.resume())
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
                    className="shrink-0 rounded-full border border-[#b49b5f]/60 px-2 py-0.5 text-[10px] font-semibold text-[#6b5729] tabular-nums"
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

      {/* Page number below, on the app side */}
      <div className="mt-3 flex items-center justify-center gap-2 text-[11px] tabular-nums text-ink-faint">
        <span className="num-ltr">Page {pageNumber} · {ayahs.length} ayahs</span>
        <span className="h-px w-10 bg-line/60" aria-hidden />
      </div>
    </div>
  )
}

/** motion wrapper to keep the reassuring page-turn exit animation. */
export function MotionMushafPaper({
  ayahs,
  pageNumber,
}: {
  ayahs: Ayah[]
  pageNumber: number
}) {
  return (
    <motion.div>
      <MushafPaper ayahs={ayahs} pageNumber={pageNumber} />
    </motion.div>
  )
}
