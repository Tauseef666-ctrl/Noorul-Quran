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
import type { Reciter } from '../types/quran'

export interface PlaybackState {
  reciterId: string
  reciter: Reciter | undefined
  setReciter: (id: string) => void
  currentAyah: { surahNumber: number; ayahNumber: number } | null
  playing: boolean
  play: (surahNumber: number, ayahNumber: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
  toggle: (surahNumber: number, ayahNumber: number) => void
  isCurrentAyah: (surahNumber: number, ayahNumber: number) => boolean
}

const AudioContext = createContext<PlaybackState | null>(null)

const RECITER_KEY = 'nq:reciter'

function readStoredReciter(): string {
  try {
    const stored = localStorage.getItem(RECITER_KEY)
    if (stored && CURATED_RECITERS.some((r) => r.id === stored)) return stored
  } catch {
    return 'ar.alafasy'
  }
  return 'ar.alafasy'
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [reciterId, setReciterIdState] = useState(readStoredReciter)
  const [currentAyah, setCurrentAyah] = useState<{ surahNumber: number; ayahNumber: number } | null>(null)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const reciter = useMemo(
    () => CURATED_RECITERS.find((r) => r.id === reciterId),
    [reciterId],
  )

  const setReciter = useCallback((id: string) => {
    setReciterIdState(id)
    try {
      localStorage.setItem(RECITER_KEY, id)
    } catch {
      return
    }
  }, [])

  // Create / reuse audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'auto'
    }
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  // Sync playing state with audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      setPlaying(false)
      setCurrentAyah(null)
    }
    const onError = () => {
      setPlaying(false)
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [])

  const play = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      const audio = audioRef.current
      if (!audio) return
      const url = verseAudioUrl(reciterId, surahNumber, ayahNumber)
      audio.src = url
      audio.load()
      audio.play().catch(() => {})
      setCurrentAyah({ surahNumber, ayahNumber })
    },
    [reciterId],
  )

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {})
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setPlaying(false)
    setCurrentAyah(null)
  }, [])

  const toggle = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      if (currentAyah?.surahNumber === surahNumber && currentAyah?.ayahNumber === ayahNumber) {
        if (playing) {
          pause()
        } else {
          resume()
        }
      } else {
        play(surahNumber, ayahNumber)
      }
    },
    [currentAyah, playing, play, pause, resume],
  )

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
      play,
      pause,
      resume,
      stop,
      toggle,
      isCurrentAyah,
    }),
    [reciterId, reciter, setReciter, currentAyah, playing, play, pause, resume, stop, toggle, isCurrentAyah],
  )

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export function useAudio(): PlaybackState {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be used within an AudioProvider')
  return ctx
}
