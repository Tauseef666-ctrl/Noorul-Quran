import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Pause, Headphones, Mic2, Loader2, Volume2 } from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import { CURATED_RECITERS, verseAudioUrl } from '../services/quran/audioProvider'
import type { Surah } from '../types/quran'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAudio } from '../store/audio'
import { fadeUp, staggerContainer } from '../animations'
import { ErrorState } from '../components/ErrorState'
import { ReciterAvatar } from '../components/ReciterAvatar'

export default function ListenPage() {
  const { data: surahs, loading, error, reload } = useAsyncData<Surah[]>(
    async (signal) => (await getActiveProvider()).getSurahList({ signal }),
    [],
  )
  const { reciterId, setReciter, playSurah, mode, currentAyah, playing, pause, resume } = useAudio()

  // Bismillah voice test — a short preview of the selected reciter's voice.
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [previewPlaying, setPreviewPlaying] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const previewRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = previewRef.current
    if (!audio) return
    const onEnded = () => {
      setPreviewPlaying(false)
      setPreviewLoading(false)
    }
    const onPlaying = () => {
      setPreviewPlaying(true)
      setPreviewLoading(false)
    }
    const onWaiting = () => setPreviewLoading(true)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('error', onEnded)
    return () => {
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('error', onEnded)
    }
  }, [])

  const previewReciter = (id: string) => {
    const audio = previewRef.current
    if (!audio) return
    if (previewId === id && previewPlaying) {
      audio.pause()
      audio.currentTime = 0
      setPreviewPlaying(false)
      setPreviewLoading(false)
      return
    }
    setPreviewId(id)
    setPreviewLoading(true)
    // Al-Fatihah 1:1 IS the Bismillah — the reciter's authentic voice test.
    audio.src = verseAudioUrl(id, 1, 1)
    audio.play().catch(() => {
      setPreviewLoading(false)
      setPreviewPlaying(false)
    })
  }

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

      {/* Reciter selection — cards: 3 across top, 3 across bottom */}
      <motion.section variants={fadeUp} className="card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Mic2 className="h-4 w-4 text-gold" aria-hidden />
          <h2 className="text-sm font-semibold text-ink">Reciters</h2>
        </div>
        <p className="mt-1 text-xs text-ink-muted">
          Tap a reciter to select them and hear their Bismillah voice test. All stream from the
          islamic.network CDN.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {CURATED_RECITERS.map((reciter) => {
            const isActive = reciterId === reciter.id
            const isPreviewing = previewId === reciter.id && previewPlaying
            const isPreviewLoading = previewId === reciter.id && previewLoading
            return (
              <button
                key={reciter.id}
                type="button"
                onClick={() => {
                  setReciter(reciter.id)
                  previewReciter(reciter.id)
                }}
                aria-pressed={isActive}
                className={`group relative flex flex-col items-center gap-3 rounded-2xl border p-4 text-center transition-all ${
                  isActive
                    ? 'border-brand bg-brand/5 shadow-[var(--shadow-glow)]'
                    : 'border-line hover:border-brand/40 hover:bg-brand/5'
                }`}
              >
                <ReciterAvatar name={reciter.name} size="lg" selected={isActive} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{reciter.name}</p>
                  <p className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-ink-faint">
                    {isPreviewing ? (
                      <span className="inline-flex items-center gap-1 text-brand">
                        <Volume2 className="h-3 w-3" aria-hidden /> Bismillah playing…
                      </span>
                    ) : isPreviewLoading ? (
                      <span className="inline-flex items-center gap-1 text-brand">
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> Loading…
                      </span>
                    ) : (
                      <>
                        <span className="num-ltr">{reciter.bitrate} kbps</span> ·{' '}
                        {isActive ? 'selected' : 'tap to preview'}
                      </>
                    )}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
        <audio ref={previewRef} preload="none" className="hidden" aria-hidden />
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
          <div className="space-y-1.5">
            {surahs.map((surah) => {
              const isPlayingHere = mode === 'surah' && currentAyah?.surahNumber === surah.number
              return (
                <div key={surah.number}>
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
                </div>
              )
            })}
          </div>
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