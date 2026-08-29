import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2,
  Repeat1,
  Repeat,
  ListVideo,
} from 'lucide-react'
import { useAudio, type PlaybackMode } from '../store/audio'
import { CURATED_RECITERS } from '../services/quran/audioProvider'
import { EqualizerBars } from './EqualizerBars'

const RATES = [0.75, 1, 1.25, 1.5]

const MODE_LABELS: Record<PlaybackMode, string> = {
  single: 'Single ayah',
  surah: 'Surah',
  range: 'Range',
  continuous: 'Continuous Quran',
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function IconButton({
  label,
  onClick,
  active,
  children,
  disabled,
}: {
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors disabled:opacity-40 ${
        active
          ? 'bg-brand/15 text-brand'
          : 'text-ink-muted hover:bg-brand/10 hover:text-brand'
      }`}
    >
      {children}
    </button>
  )
}

export function AudioPlayer() {
  const audio = useAudio()
  const [expanded, setExpanded] = useState(false)

  if (!audio.currentAyah) return null

  const {
    currentAyah,
    playing,
    loading,
    error,
    currentTime,
    duration,
    queueProgress,
    queue,
    mode,
    reciterId,
    setReciter,
    rate,
    setRate,
    volume,
    setVolume,
    repeatAyah,
    toggleRepeatAyah,
    repeatSurah,
    toggleRepeatSurah,
    autoNext,
    toggleAutoNext,
    pause,
    resume,
    next,
    prev,
    seek,
    stop,
  } = audio

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', damping: 26, stiffness: 260 }}
      className="glass-ctl fixed inset-x-0 bottom-14 z-40 rounded-t-2xl sm:rounded-2xl lg:inset-x-auto lg:bottom-5 lg:left-1/2 lg:w-[min(46rem,96vw)] lg:-translate-x-1/2"
      role="region"
      aria-label="Audio player"
    >
      {/* Primary row */}
      <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
        {/* Close */}
        <button
          type="button"
          onClick={stop}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          aria-label="Close audio player"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Now playing */}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-xs font-semibold text-ink">
            {playing && (
              <EqualizerBars />
            )}
            {loading ? 'Loading…' : `Surah ${currentAyah.surahNumber} · Ayah ${currentAyah.ayahNumber}`}
          </p>
          <p className="flex items-center gap-1 text-[10px] text-ink-faint">
            <span>{queueProgress} / {queue.length}</span>
            {mode && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-brand/10 px-1.5 py-px text-[9px] font-semibold text-brand">
                <ListVideo className="h-2.5 w-2.5" aria-hidden />
                {MODE_LABELS[mode]}
              </span>
            )}
            <span className="truncate">· {reciterId.replace('ar.', '').replace(/[_.-]/g, ' ')}</span>
            {repeatAyah && (
              <span className="inline-flex items-center gap-0.5 text-gold" title="Repeat ayah">
                <Repeat1 className="h-2.5 w-2.5" aria-hidden />1
              </span>
            )}
          </p>
        </div>

        {/* Transport */}
        <IconButton label="Previous ayah" onClick={prev}>
          <SkipBack className="h-4 w-4" />
        </IconButton>
        <IconButton
          label={playing ? 'Pause' : 'Play'}
          onClick={() => (playing ? pause() : resume())}
        >
          {loading && !playing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </IconButton>
        <IconButton label="Next ayah" onClick={next}>
          <SkipForward className="h-4 w-4" />
        </IconButton>

        {/* Expand */}
        <IconButton
          label={expanded ? 'Hide controls' : 'More controls'}
          onClick={() => setExpanded(!expanded)}
          active={expanded}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </IconButton>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 px-3 pb-2.5 sm:gap-3 sm:px-4">
        <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-ink-faint">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          className="slider-audio min-w-0 flex-1"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek"
          style={{ background: `linear-gradient(to right, var(--brand) ${progressPct}%, var(--line-strong) ${progressPct}%)` }}
          disabled={duration <= 0}
        />
        <span className="w-9 shrink-0 text-[10px] tabular-nums text-ink-faint">
          {formatTime(duration)}
        </span>
      </div>

      {error && (
        <p className="px-4 pb-2 text-[11px] text-red-700 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {/* Expanded controls */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-line/60 px-4 py-3">
              <div className="flex h-4 items-center justify-center">
                <div className="gold-divider w-16" />
              </div>

              {/* Reciter */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-faint">
                  Reciter
                </p>
                <select
                  value={reciterId}
                  onChange={(e) => setReciter(e.target.value)}
                  aria-label="Select reciter"
                  className="mt-1.5 w-full appearance-none rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  {CURATED_RECITERS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-faint">
                  Speed
                </p>
                <div className="mt-1.5 flex gap-1.5">
                  {RATES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRate(r)}
                      aria-pressed={rate === r}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                        rate === r
                          ? 'border-brand bg-brand text-white'
                          : 'border-line text-ink-muted hover:border-brand hover:text-brand'
                      }`}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-faint">
                  Volume
                </p>
                <input
                  type="range"
                  className="slider-audio min-w-0 flex-1"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="Volume"
                  style={{ background: `linear-gradient(to right, var(--brand) ${volume * 100}%, var(--line-strong) ${volume * 100}%)` }}
                />
                <span className="w-8 text-right text-[10px] tabular-nums text-ink-faint">
                  {Math.round(volume * 100)}%
                </span>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={toggleRepeatAyah}
                  aria-pressed={repeatAyah}
                  className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                    repeatAyah
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-line text-ink-muted hover:border-gold hover:text-gold'
                  }`}
                >
                  <Repeat1 className="h-3 w-3" aria-hidden />
                  Repeat ayah
                </button>
                <button
                  type="button"
                  onClick={toggleRepeatSurah}
                  aria-pressed={repeatSurah}
                  className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                    repeatSurah
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-line text-ink-muted hover:border-gold hover:text-gold'
                  }`}
                >
                  <Repeat className="h-3 w-3" aria-hidden />
                  Repeat {mode === 'surah' ? 'surah' : 'queue'}
                </button>
                <button
                  type="button"
                  onClick={toggleAutoNext}
                  aria-pressed={autoNext}
                  className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                    autoNext
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-line text-ink-muted hover:border-brand hover:text-brand'
                  }`}
                >
                  <ListVideo className="h-3 w-3" aria-hidden />
                  Auto-next
                </button>
              </div>

              {/* Attribution */}
              <p className="text-center text-[9px] leading-relaxed text-ink-faint">
                Recitations © their respective reciters, served via the islamic.network CDN under
                its terms. Audio is streamed on demand and is not cached offline.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}