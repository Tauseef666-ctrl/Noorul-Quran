import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { verseAudioUrl, CURATED_RECITERS } from '../services/quran/audioProvider'
import { AYAH_COUNTS, TOTAL_SURAHS, isValidAyah, isValidSurah } from '../data/ayahCounts'
import type { Reciter } from '../types/quran'

export type PlaybackMode = 'single' | 'surah' | 'range' | 'continuous'

export interface QueueItem {
  surahNumber: number
  ayahNumber: number
}

export interface QueueState {
  mode: PlaybackMode | null
  items: QueueItem[]
  index: number
}

interface PlaybackState {
  // Reciter
  reciterId: string
  reciter: Reciter | undefined
  setReciter: (id: string) => void
  // Now playing
  currentAyah: QueueItem | null
  playing: boolean
  loading: boolean
  error: string | null
  currentTime: number
  duration: number
  // Playback preferences
  volume: number
  setVolume: (volume: number) => void
  rate: number
  setRate: (rate: number) => void
  repeatAyah: boolean
  toggleRepeatAyah: () => void
  repeatSurah: boolean
  toggleRepeatSurah: () => void
  autoNext: boolean
  toggleAutoNext: () => void
  // Queue info
  mode: PlaybackMode | null
  queue: QueueItem[]
  queueIndex: number
  queueProgress: number
  // Actions
  play: (surahNumber: number, ayahNumber: number) => void
  playSurah: (surahNumber: number, startAyah?: number) => void
  playRange: (items: QueueItem[]) => void
  playContinuous: (surahNumber: number, ayahNumber: number) => void
  toggle: (surahNumber: number, ayahNumber: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
  retry: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  isCurrentAyah: (surahNumber: number, ayahNumber: number) => boolean
}

const AudioContext = createContext<PlaybackState | null>(null)

const RECITER_KEY = 'nq:reciter'
const VOLUME_KEY = 'nq:volume'
const RATE_KEY = 'nq:playback-rate'
const REPEAT_AYAH_KEY = 'nq:repeat-ayah'
const REPEAT_SURAH_KEY = 'nq:repeat-surah'
const AUTONEXT_KEY = 'nq:auto-next'

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function readStoredReciter(): string {
  const stored = readStored<string | null>(RECITER_KEY, null)
  if (stored && CURATED_RECITERS.some((r) => r.id === stored)) return stored
  return 'ar.alafasy'
}

function readStoredRate(): number {
  const stored = readStored<number | null>(RATE_KEY, null)
  if (stored && [0.75, 1, 1.25, 1.5].includes(stored)) return stored
  return 1
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [reciterId, setReciterIdState] = useState(readStoredReciter)
  const [volume, setVolumeState] = useState(() => readStored<number>(VOLUME_KEY, 1))
  const [rate, setRateState] = useState(readStoredRate)
  const [repeatAyah, setRepeatAyah] = useState(() => readStored<boolean>(REPEAT_AYAH_KEY, false))
  const [repeatSurah, setRepeatSurah] = useState(() => readStored<boolean>(REPEAT_SURAH_KEY, false))
  const [autoNext, setAutoNext] = useState(() => readStored<boolean>(AUTONEXT_KEY, true))

  const [queueState, setQueueState] = useState<QueueState>({
    mode: null,
    items: [],
    index: 0,
  })
  const [currentAyah, setCurrentAyah] = useState<QueueItem | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Mutable mirrors for event handlers / lazy loads (avoid stale closures)
  const reciterRef = useRef(reciterId)
  const volumeRef = useRef(volume)
  const rateRef = useRef(rate)
  const autoNextRef = useRef(autoNext)
  const repeatAyahRef = useRef(repeatAyah)
  const repeatSurahRef = useRef(repeatSurah)
  const queueRef = useRef(queueState)
  const playingRef = useRef(playing)

  useEffect(() => {
    reciterRef.current = reciterId
  }, [reciterId])
  useEffect(() => {
    volumeRef.current = volume
  }, [volume])
  useEffect(() => {
    rateRef.current = rate
  }, [rate])
  useEffect(() => {
    autoNextRef.current = autoNext
  }, [autoNext])
  useEffect(() => {
    repeatAyahRef.current = repeatAyah
  }, [repeatAyah])
  useEffect(() => {
    repeatSurahRef.current = repeatSurah
  }, [repeatSurah])
  useEffect(() => {
    queueRef.current = queueState
  }, [queueState])
  useEffect(() => {
    playingRef.current = playing
  }, [playing])

  const reciter = useMemo(
    () => CURATED_RECITERS.find((r) => r.id === reciterId),
    [reciterId],
  )

  const setReciter = useCallback((id: string) => {
    setReciterIdState(id)
    try {
      localStorage.setItem(RECITER_KEY, JSON.stringify(id))
    } catch {
      return
    }
  }, [])

  const setVolume = useCallback((next: number) => {
    const clamped = Math.min(1, Math.max(0, next))
    setVolumeState(clamped)
    try {
      localStorage.setItem(VOLUME_KEY, JSON.stringify(clamped))
    } catch {
      return
    }
  }, [])

  const setRate = useCallback((next: number) => {
    setRateState(next)
    try {
      localStorage.setItem(RATE_KEY, JSON.stringify(next))
    } catch {
      return
    }
  }, [])

  const toggleRepeatAyah = useCallback(() => {
    setRepeatAyah((prev) => {
      try {
        localStorage.setItem(REPEAT_AYAH_KEY, JSON.stringify(!prev))
      } catch {
        return prev
      }
      return !prev
    })
  }, [])

  const toggleRepeatSurah = useCallback(() => {
    setRepeatSurah((prev) => {
      try {
        localStorage.setItem(REPEAT_SURAH_KEY, JSON.stringify(!prev))
      } catch {
        return prev
      }
      return !prev
    })
  }, [])

  const toggleAutoNext = useCallback(() => {
    setAutoNext((prev) => {
      try {
        localStorage.setItem(AUTONEXT_KEY, JSON.stringify(!prev))
      } catch {
        return prev
      }
      return !prev
    })
  }, [])

  // Create / reuse a single audio element. preload=metadata: we set a fresh
  // src per item and never bulk-prefetch — buffer only once playback starts.
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'metadata'
    }
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  // Media events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => {
      setPlaying(true)
      setLoading(false)
    }
    const onPause = () => setPlaying(false)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration)
    }
    const onWaiting = () => setLoading(true)
    const onCanPlay = () => setLoading(false)
    const onError = () => {
      setLoading(false)
      setPlaying(false)
      setError('This audio is currently unavailable. Try another reciter or check your connection.')
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('error', onError)
    }
  }, [])

  const loadItem = useCallback((item: QueueItem, autoplay: boolean) => {
    const audio = audioRef.current
    if (!audio) return
    audio.src = verseAudioUrl(reciterRef.current, item.surahNumber, item.ayahNumber)
    audio.playbackRate = rateRef.current
    audio.volume = volumeRef.current
    setCurrentAyah(item)
    setError(null)
    setLoading(true)
    setCurrentTime(0)
    setDuration(0)
    if (autoplay) {
      const result = audio.play()
      if (result) {
        result.catch((err: unknown) => {
          // Autoplay blocked without a user gesture is expected (AbortError),
          // not a transport failure — surface it as paused, not an alert.
          if (err instanceof DOMException && err.name === 'AbortError') {
            setPlaying(false)
            return
          }
          setError('Unable to play audio. Check your connection.')
        })
      }
    }
  }, [])

  const playQueue = useCallback(
    (state: QueueState, index: number) => {
      const nextState = { ...state, index }
      queueRef.current = nextState
      setQueueState(nextState)
      loadItem(nextState.items[index], true)
    },
    [loadItem],
  )

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setPlaying(false)
    setLoading(false)
    setError(null)
    setCurrentTime(0)
    setDuration(0)
    queueRef.current = { mode: null, items: [], index: 0 }
    setQueueState({ mode: null, items: [], index: 0 })
    setCurrentAyah(null)
  }, [])

  const stepForward = useCallback(() => {
    const { mode, items, index } = queueRef.current
    if (mode === null || items.length === 0) return
    if (index + 1 < items.length) {
      playQueue({ mode, items, index }, index + 1)
      return
    }
    // End of queue
    if (mode === 'continuous') {
      const last = items[items.length - 1]
      if (last && last.surahNumber < TOTAL_SURAHS) {
        const nextSurah = last.surahNumber + 1
        const extra: QueueItem[] = Array.from(
          { length: AYAH_COUNTS[nextSurah - 1] },
          (_, i) => ({ surahNumber: nextSurah, ayahNumber: i + 1 }),
        )
        const extended = [...items, ...extra]
        playQueue({ mode: 'continuous', items: extended, index }, index + 1)
        return
      }
      stop()
      return
    }
    if (repeatSurahRef.current) {
      playQueue({ mode, items, index }, 0)
      return
    }
    stop()
  }, [playQueue, stop])

  const handleEnded = useCallback(() => {
    if (repeatAyahRef.current) {
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = 0
        audio.play().catch(() => {})
      }
      return
    }
    if (!autoNextRef.current) {
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      setPlaying(false)
      return
    }
    stepForward()
  }, [stepForward])

  // Register ended handler (depends on handleEnded)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => handleEnded()
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [handleEnded])

  // Keep fast-forward/clamped rate & volume applied to the live element
  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = volume
  }, [volume])
  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.playbackRate = rate
  }, [rate])

  // Reload the current item when the reciter changes (only while something is loaded)
  useEffect(() => {
    if (!currentAyah) return
    loadItem(currentAyah, playingRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reciterId])

  const play = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      if (!isValidAyah(surahNumber, ayahNumber)) return
      playQueue({ mode: 'single', items: [{ surahNumber, ayahNumber }], index: 0 }, 0)
    },
    [playQueue],
  )

  const playSurah = useCallback(
    (surahNumber: number, startAyah = 1) => {
      if (!isValidSurah(surahNumber)) return
      const count = AYAH_COUNTS[surahNumber - 1]
      const start = Math.min(Math.max(1, startAyah), count)
      const items: QueueItem[] = Array.from({ length: count - start + 1 }, (_, i) => ({
        surahNumber,
        ayahNumber: start + i,
      }))
      playQueue({ mode: 'surah', items, index: 0 }, 0)
    },
    [playQueue],
  )

  const playRange = useCallback(
    (items: QueueItem[]) => {
      if (items.length === 0) return
      playQueue({ mode: 'range', items, index: 0 }, 0)
    },
    [playQueue],
  )

  const playContinuous = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      if (!isValidAyah(surahNumber, ayahNumber)) return
      const items: QueueItem[] = []
      for (let surah = surahNumber; surah <= TOTAL_SURAHS; surah++) {
        const start = surah === surahNumber ? ayahNumber : 1
        const count = AYAH_COUNTS[surah - 1]
        for (let ayah = start; ayah <= count; ayah++) {
          items.push({ surahNumber: surah, ayahNumber: ayah })
        }
      }
      playQueue({ mode: 'continuous', items, index: 0 }, 0)
    },
    [playQueue],
  )

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const resume = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentAyah) return
    audio.play().catch((err: unknown) => {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError('Unable to resume audio. Check your connection.')
    })
  }, [currentAyah])

  const retry = useCallback(() => {
    if (!currentAyah) return
    loadItem(currentAyah, true)
  }, [currentAyah, loadItem])

  const toggle = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      if (currentAyah?.surahNumber === surahNumber && currentAyah?.ayahNumber === ayahNumber) {
        if (playing) pause()
        else resume()
      } else {
        play(surahNumber, ayahNumber)
      }
    },
    [currentAyah, playing, play, pause, resume],
  )

  const next = useCallback(() => {
    stepForward()
  }, [stepForward])

  const prev = useCallback(() => {
    const { items, index } = queueRef.current
    const audio = audioRef.current
    if (!audio || items.length === 0) return
    if (index > 0) {
      playQueue(queueRef.current, index - 1)
    } else {
      audio.currentTime = 0
      setCurrentTime(0)
    }
  }, [playQueue])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    const clamped = Math.min(Math.max(0, time), audio.duration || 0)
    audio.currentTime = clamped
    setCurrentTime(clamped)
  }, [])

  const isCurrentAyah = useCallback(
    (surahNumber: number, ayahNumber: number) =>
      currentAyah?.surahNumber === surahNumber && currentAyah?.ayahNumber === ayahNumber,
    [currentAyah],
  )

  const value = useMemo<PlaybackState>(
    () => ({
      reciterId,
      reciter,
      setReciter,
      currentAyah,
      playing,
      loading,
      error,
      currentTime,
      duration,
      volume,
      setVolume,
      rate,
      setRate,
      repeatAyah,
      toggleRepeatAyah,
      repeatSurah,
      toggleRepeatSurah,
      autoNext,
      toggleAutoNext,
      mode: queueState.mode,
      queue: queueState.items,
      queueIndex: queueState.index,
      queueProgress: queueState.items.length > 0 ? queueState.index + 1 : 0,
      play,
      playSurah,
      playRange,
      playContinuous,
      toggle,
      pause,
      resume,
      stop,
      retry,
      next,
      prev,
      seek,
      isCurrentAyah,
    }),
    [
      reciterId,
      reciter,
      setReciter,
      currentAyah,
      playing,
      loading,
      error,
      currentTime,
      duration,
      volume,
      setVolume,
      rate,
      setRate,
      repeatAyah,
      toggleRepeatAyah,
      repeatSurah,
      toggleRepeatSurah,
      autoNext,
      toggleAutoNext,
      queueState,
      play,
      playSurah,
      playRange,
      playContinuous,
      toggle,
      pause,
      resume,
      stop,
      retry,
      next,
      prev,
      seek,
      isCurrentAyah,
    ],
  )

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export function useAudio(): PlaybackState {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be used within an AudioProvider')
  return ctx
}