import { useEffect, useRef } from 'react'
import { useAudio } from '../store/audio'
import { loadCanonicalDataset } from '../data/canonicalQuran'
import { CURATED_RECITERS } from '../services/quran/audioProvider'

/**
 * Bridges the web `useAudio` store to the native Android media session so that
 * when a user plays an ayah, a brand-styled, fully-controllable notification is
 * shown in the system shade / lockscreen:
 *   - play / pause
 *   - skip to previous / next ayah
 *   - seek forward / backward (fast-forward / rewind)
 *   - drag the seek bar to a timestamp (seekTo)
 *
 * The plugin is native-only (`@capgo/capacitor-media-session`). On the web build
 * `Capacitor.isNativePlatform()` is false and this component simply renders
 * null — it never affects the website.
 */

type MediaSessionModule = typeof import('@capgo/capacitor-media-session')['MediaSession']
type MediaAction = NonNullable<Parameters<MediaSessionModule['setActionHandler']>[0]['action']>

/** Lazily import Capacitor and the plugin so the web bundle never references them at load. */
async function getMediaSession(): Promise<MediaSessionModule | null> {
  const { Capacitor } = await import('@capacitor/core')
  if (!Capacitor.isNativePlatform()) return null
  const { MediaSession } = await import('@capgo/capacitor-media-session')
  return MediaSession
}

// Brand artwork (Rub el Hizb mark) served by the web app — used as the
// notification's large icon on native.
const ARTWORK_URL = `${import.meta.env.BASE_URL || '/'}icons/pwa-512.png`

const ALL_ACTIONS: MediaAction[] = [
  'play',
  'pause',
  'seekbackward',
  'seekforward',
  'previoustrack',
  'nexttrack',
  'seekto',
  'stop',
]

export function MediaSessionBridge() {
  const audio = useAudio()
  const sessionRef = useRef<MediaSessionModule | null>(null)

  // Reflect the latest store state into a ref so registered handlers (mounted
  // once) never close over stale values.
  const audioRef = useRef(audio)
  useEffect(() => {
    audioRef.current = audio
  })

  // Lazily obtain the native session once.
  useEffect(() => {
    let active = true
    getMediaSession().then((session) => {
      if (active) sessionRef.current = session
    })
    return () => {
      active = false
      sessionRef.current = null
    }
  }, [])

  // Push metadata + position whenever the current ayah / reciter / time changes.
  useEffect(() => {
    const session = sessionRef.current
    const ayah = audio.currentAyah
    if (!session || !ayah) return

    let cancelled = false
    ;(async () => {
      let surahName = `Surah ${ayah.surahNumber}`
      let surahArabic = ''
      try {
        const dataset = await loadCanonicalDataset()
        const meta = dataset.surahs[ayah.surahNumber - 1]
        if (meta) {
          surahName = meta.tr || surahName
          surahArabic = meta.ar || ''
        }
      } catch {
        /* fall back to generic name */
      }
      if (cancelled) return

      const reciter =
        CURATED_RECITERS.find((r) => r.id === audio.reciterId)?.name ?? 'NoorulQuran'
      const title = `${surahName} · Ayah ${ayah.ayahNumber}`
      const artist = surahArabic ? `${surahArabic} — ${reciter}` : reciter

      await Promise.all([
        session.setMetadata({
          title,
          artist,
          album: 'NoorulQuran',
          artwork: [{ src: ARTWORK_URL, sizes: '512x512', type: 'image/png' }],
        }),
        session.setPositionState({
          duration: Math.round(audio.duration) || 0,
          position: Math.round(audio.currentTime) || 0,
          playbackRate: audio.rate,
        }),
      ]).catch(() => {})
    })()

    return () => {
      cancelled = true
    }
  }, [audio.currentAyah, audio.reciterId, audio.duration, audio.currentTime, audio.rate])

  // Reflect play/pause state.
  useEffect(() => {
    const session = sessionRef.current
    if (!session) return
    if (!audio.currentAyah) {
      session.setPlaybackState({ playbackState: 'none' }).catch(() => {})
      return
    }
    session
      .setPlaybackState({ playbackState: audio.playing ? 'playing' : 'paused' })
      .catch(() => {})
  }, [audio.playing, audio.currentAyah])

  // Register action handlers once (routed through audioRef).
  useEffect(() => {
    const session = sessionRef.current
    if (!session) return

    const register = (action: MediaAction, handler?: (d: { seekTime?: number }) => void) =>
      session.setActionHandler({ action }, (handler as never) ?? null).catch(() => {})

    register('play', () => audioRef.current.resume())
    register('pause', () => audioRef.current.pause())
    register('seekbackward', () => audioRef.current.seek(Math.max(0, audioRef.current.currentTime - 30)))
    register('seekforward', () => audioRef.current.seek(audioRef.current.currentTime + 30))
    register('previoustrack', () => audioRef.current.prev())
    register('nexttrack', () => audioRef.current.next())
    register('seekto', (d) => {
      if (typeof d?.seekTime === 'number') audioRef.current.seek(d.seekTime)
    })
    register('stop', () => audioRef.current.stop())

    return () => {
      ALL_ACTIONS.forEach((action) => register(action))
    }
  }, [])

  return null
}
