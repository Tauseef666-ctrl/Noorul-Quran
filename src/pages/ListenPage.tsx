import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Pause, Headphones, Mic2 } from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import { CURATED_RECITERS } from '../services/quran/audioProvider'
import type { Surah } from '../types/quran'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAudio } from '../store/audio'
import { fadeUp, staggerContainer } from '../animations'
import { ErrorState } from '../components/ErrorState'

export default function ListenPage() {
  const { data: surahs, loading, error, reload } = useAsyncData<Surah[]>(
    async (signal) => (await getActiveProvider()).getSurahList({ signal }),
    [],
  )
  const { reciterId, setReciter, playSurah, mode, currentAyah, playing, pause, resume } = useAudio()

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.header variants={fadeUp}>
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-brand" aria-hidden />
          <h1 className="text-2xl font-bold text-ink">Listen</h1>
        </div>
        <p className="text-sm text-ink-muted">
          Audio-first Quran browsing — playback continues across the app
        </p>
      </motion.header>

      {/* Reciter selection */}
      <motion.section variants={fadeUp} className="card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Mic2 className="h-4 w-4 text-gold" aria-hidden />
          <h2 className="text-sm font-semibold text-ink">Reciter</h2>
        </div>
        <p className="mt-1 text-xs text-ink-muted">
          Choose who you would like to hear. All reciters stream from the islamic.network CDN.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CURATED_RECITERS.map((reciter) => {
            const isActive = reciterId === reciter.id
            return (
              <button
                key={reciter.id}
                type="button"
                onClick={() => setReciter(reciter.id)}
                aria-pressed={isActive}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  isActive
                    ? 'border-brand bg-brand/5'
                    : 'border-line hover:border-brand/40 hover:bg-brand/5'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isActive ? 'bg-brand text-white' : 'bg-brand/10 text-brand'
                  }`}
                >
                  <Play className="h-3.5 w-3.5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink">{reciter.name}</p>
                  <p className="text-[10px] text-ink-faint">
                    {reciter.bitrate} kbps{isActive ? ' · selected' : ''}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </motion.section>

      {/* Surah list for quick play */}
      <motion.section variants={fadeUp}>
        <h2 className="mb-3 text-sm font-semibold text-ink">Quick Play — Surahs</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="skeleton-glass h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton-glass h-3 w-24" />
                    <div className="skeleton-glass h-2 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Couldn't load the surah list"
            message={error}
            onRetry={reload}
          />
        ) : surahs && (
          <motion.div variants={staggerContainer} className="space-y-1.5">
            {surahs.map((surah) => {
              const isPlayingHere = mode === 'surah' && currentAyah?.surahNumber === surah.number
              return (
                <motion.div key={surah.number} variants={fadeUp}>
                  <div className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPlayingHere) {
                          if (playing) pause()
                          else resume()
                        } else {
                          playSurah(surah.number)
                        }
                      }}
                      aria-label={
                        isPlayingHere && playing
                          ? `Pause surah ${surah.number}`
                          : `Play surah ${surah.number}`
                      }
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isPlayingHere
                          ? 'bg-gold text-white'
                          : 'bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white'
                      }`}
                    >
                      {isPlayingHere && playing ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink">
                        {surah.number}. {surah.nameTransliterated}
                      </p>
                      <p className="text-[10px] text-ink-faint">
                        {surah.numberOfAyahs} ayahs · {surah.revelationType}
                      </p>
                    </div>
                    <Link
                      to={`/surah/${surah.number}`}
                      className="text-[11px] font-semibold text-brand hover:underline"
                    >
                      Read →
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </motion.section>

      {/* Attribution */}
      <motion.section variants={fadeUp} className="rounded-xl border border-line px-4 py-3">
        <p className="text-[11px] leading-relaxed text-ink-faint">
          Recitations © their respective reciters and are served via the islamic.network CDN under
          its terms. Audio is streamed on demand and is never bulk-downloaded or cached offline.
          Only the reciters listed above are offered, matching what the audio source actually
          provides.
        </p>
      </motion.section>
    </motion.div>
  )
}