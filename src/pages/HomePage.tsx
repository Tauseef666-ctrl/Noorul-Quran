import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Headphones,
  ArrowRight,
  Compass,
  Library,
  Bookmark,
  CalendarCheck,
  Play,
  Sparkles,
} from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import type { Surah, Ayah } from '../types/quran'
import { useReadingProgress } from '../hooks/useReadingProgress'
import { useBookmarks } from '../store/bookmarks'
import { useTranslations } from '../store/translations'
import { AYAH_COUNTS, TOTAL_AYAHS } from '../data/ayahCounts'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAudio } from '../store/audio'
import { GeometricPattern } from '../components/GeometricPattern'
import { EqualizerBars } from '../components/EqualizerBars'
import { ErrorState } from '../components/ErrorState'
import { LogoMark } from '../components/Brand'
import { HeroVisual } from '../components/HeroVisual'
import { langDir } from '../services/quran/translationProvider'
import {
  heroStagger,
  heroItem,
  fadeUp,
  staggerContainer,
  pageTransition,
} from '../animations'

function readingPercent(surahNumber: number, ayahNumber: number): number {
  let global = 0
  for (let i = 0; i < surahNumber - 1; i++) global += AYAH_COUNTS[i]
  global += ayahNumber
  return Math.min(100, Math.max(0, Math.round((global / TOTAL_AYAHS) * 100)))
}

function getDailyAyah(): { surahNumber: number; ayahNumber: number } {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  )
  const globalIndex = dayOfYear % 6236
  let accumulated = 0
  for (let i = 0; i < AYAH_COUNTS.length; i++) {
    accumulated += AYAH_COUNTS[i]
    if (globalIndex < accumulated) {
      return { surahNumber: i + 1, ayahNumber: globalIndex - (accumulated - AYAH_COUNTS[i]) + 1 }
    }
  }
  return { surahNumber: 114, ayahNumber: 6 }
}

const daily = getDailyAyah()

const viewportOnce = { once: true, margin: '-60px' } as const

export default function HomePage() {
  const { data: surahs, error: surahsError, reload: reloadSurahs } = useAsyncData<Surah[]>(
    async (signal) => (await getActiveProvider()).getSurahList({ signal }),
    [],
  )

  const [dailyAyah, setDailyAyah] = useState<Ayah | null>(null)
  const [dailyError, setDailyError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [dailyTranslations, setDailyTranslations] = useState<Record<string, string>>({})
  const { activeIds, primaryEdition } = useTranslations()

  useEffect(() => {
    const controller = new AbortController()

    getActiveProvider().then((provider) =>
      provider
        .getAyah(daily.surahNumber, daily.ayahNumber, { signal: controller.signal })
        .then((ayah) => {
          if (!controller.signal.aborted) setDailyAyah(ayah)
        }),
    ).catch((err) => {
      if (!controller.signal.aborted) {
        setDailyError(err instanceof Error ? err.message : "Couldn't load today's ayah.")
      }
    })

    return () => controller.abort()
  }, [attempt])

  useEffect(() => {
    const controller = new AbortController()

    import('../services/quran/alQuranCloudProvider').then(({ getTranslationsForAyah }) => {
      getTranslationsForAyah(daily.surahNumber, daily.ayahNumber, activeIds, controller.signal).then(
        (trans) => {
          if (!controller.signal.aborted) setDailyTranslations(trans)
        },
      )
    }).catch(() => {
      // Translation unavailable — the daily card simply omits translation text
    })

    return () => controller.abort()
  }, [activeIds])

  const { progress } = useReadingProgress()
  const { bookmarks } = useBookmarks()
  const { playSurah, mode, currentAyah, playing, pause, resume, toggle, isCurrentAyah } = useAudio()

  const featuredSurahs = surahs?.slice(0, 6) ?? []
  const dailyIsPlaying = dailyAyah
    ? isCurrentAyah(dailyAyah.surahNumber, dailyAyah.ayahNumber) && playing
    : false
  const dailyPrimaryText = primaryEdition ? (dailyTranslations[primaryEdition.id] ?? '') : ''
  const journeyTotalPct = progress
    ? readingPercent(progress.surahNumber, progress.ayahNumber)
    : 0
  const currentJuz = progress?.juz ?? 1
  const currentSurah = progress?.surahNumber ?? 1
  const continuePage = progress?.page ?? 1
  const journeyStats = [
    {
      label: 'Reading Progress',
      value: `${journeyTotalPct}% of Quran`,
      pct: journeyTotalPct,
      delay: 0,
      icon: BookOpen,
    },
    {
      label: 'Current Juz',
      value: `Juz ${currentJuz} of 30`,
      pct: (currentJuz / 30) * 100,
      delay: 0.08,
      icon: Compass,
    },
    {
      label: 'Surahs Explored',
      value: `Surah ${currentSurah} of 114`,
      pct: (currentSurah / 114) * 100,
      delay: 0.16,
      icon: Library,
    },
  ]

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" className="space-y-10">
      {/* ── Cinematic editorial hero — staged reveal ──────────────────────── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={heroStagger}
        className="relative overflow-hidden rounded-[2rem] border border-gold/15 bg-gradient-to-b from-emerald-900/5 via-transparent to-transparent"
      >
        {/* Ambient glow behind everything (staged step 1) */}
        <motion.div aria-hidden className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
        <motion.div
          variants={heroItem}
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
        >
          <GeometricPattern
            variant="gold"
            className="absolute inset-x-0 top-0 h-full w-full object-cover"
            opacity={0.12}
          />
        </motion.div>

        {/* Editorial split: left = branding + copy + actions, right = visual */}
        <div className="grid items-center gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-20">
          {/* ── Left: branding + text + actions ─────────────────────────── */}
          <div className="relative order-2 text-center lg:order-1 lg:text-left">
            <motion.div variants={heroItem} className="flex justify-center lg:justify-start">
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-black/30 ring-1 ring-white/10 shadow-lg">
                <LogoMark className="h-10 w-10" />
              </span>
            </motion.div>

            <motion.h1
              variants={heroItem}
              className="mt-6 text-4xl font-extrabold leading-tight text-ink sm:text-5xl lg:text-6xl"
            >
              Noorul<span className="text-gold">Quran</span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="arabic-heading mt-3 text-2xl text-brand sm:text-3xl"
              lang="ar"
              dir="rtl"
              translate="no"
            >
              نور القرآن
            </motion.p>

            <motion.p
              variants={heroItem}
              className="mt-3 text-base font-medium tracking-wide text-ink-muted"
            >
              Read. Listen. Reflect.
            </motion.p>

            <motion.p variants={heroItem} className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-faint lg:mx-0">
              Explore the complete Quran with faithful Arabic text, curated
              translations, tafsir, and recitation — all in a calm, refined space.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={heroItem}
              className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              <Link
                to="/surahs"
                className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-brand-deep hover:shadow-[var(--shadow-lifted)]"
              >
                <BookOpen className="h-4 w-4" aria-hidden />
                Read Quran
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                to="/listen"
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-surface/70 px-6 py-3 text-sm font-semibold text-ink backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-surface-strong"
              >
                <Headphones className="h-4 w-4 text-gold" aria-hidden />
                Listen
              </Link>
            </motion.div>
          </div>

          {/* ── Right: cinematic hero visual ─────────────────────────────── */}
          <motion.div variants={heroItem} className="relative order-1 lg:order-2">
            <HeroVisual className="aspect-[5/4] sm:aspect-[4/3] lg:aspect-square" />
          </motion.div>
        </div>
      </motion.section>

      {/* ── Continue Reading ────────────────────────────────────────────────── */}
      {progress && (
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce}>
          <Link
            to={`/surah/${progress.surahNumber}?ayah=${progress.ayahNumber}`}
            className="card group block rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  Continue Reading
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">
                  Surah {progress.surahNumber} · Ayah {progress.ayahNumber}
                </p>
                <p className="text-sm text-ink-muted">Page {progress.page} · Juz {progress.juz}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold text-brand">
                  {readingPercent(progress.surahNumber, progress.ayahNumber)}%
                </p>
                <p className="text-[10px] text-ink-faint">complete</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand to-gold"
                initial={{ width: 0 }}
                whileInView={{ width: `${readingPercent(progress.surahNumber, progress.ayahNumber)}%` }}
                viewport={viewportOnce}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <ArrowRight className="mt-3 h-5 w-5 text-brand transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </motion.section>
      )}

      {/* ── Daily Ayah — signature component ────────────────────────────────── */}
      {dailyError ? (
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <ErrorState
            title="Couldn't load today's ayah"
            message={dailyError}
            onRetry={() => {
              setDailyError(null)
              setAttempt((a) => a + 1)
            }}
          />
        </motion.section>
      ) : (
      dailyAyah && (
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce}>
          <div className="glass relative overflow-hidden rounded-3xl border-gold/25 bg-gradient-to-br from-emerald-900/[0.08] via-transparent to-gold/[0.06] p-6 sm:p-10">
            <GeometricPattern
              variant="emerald"
              className="absolute inset-0 h-full w-full object-cover"
              opacity={0.3}
            />
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="relative"
            >
              <motion.div variants={fadeUp} className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  Ayah of the Day
                </p>
              </motion.div>
              <motion.p
                variants={fadeUp}
                className="quran-text text-right"
                lang="ar"
                dir="rtl"
                translate="no"
              >
                {dailyAyah.arabic}
              </motion.p>
              {dailyPrimaryText && primaryEdition && (
                <motion.p
                  variants={fadeUp}
                  lang={primaryEdition.language}
                  dir={langDir(primaryEdition.language)}
                  translate="no"
                  className={`translation-${primaryEdition.language} mt-4 text-[15px] leading-relaxed text-ink-muted`}
                >
                  {dailyPrimaryText}
                </motion.p>
              )}
              <motion.div
                variants={fadeUp}
                className="mt-5 flex flex-wrap items-center justify-between gap-3"
              >
                <span className="text-xs font-semibold text-ink-faint">
                  {dailyAyah.surahNumber}:{dailyAyah.ayahNumber}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggle(dailyAyah.surahNumber, dailyAyah.ayahNumber)}
                    aria-label={dailyIsPlaying ? 'Pause this ayah' : 'Listen to this ayah'}
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-brand-deep active:scale-95"
                  >
                    {dailyIsPlaying ? (
                      <>
                        <EqualizerBars />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" aria-hidden />
                        Listen
                      </>
                    )}
                  </button>
                  <Link
                    to={`/surah/${dailyAyah.surahNumber}?ayah=${dailyAyah.ayahNumber}`}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Read full context →
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      )
      )}

      {/* ── Quick Explorers ─────────────────────────────────────────────────── */}
      <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce}>
        <h2 className="mb-4 text-lg font-semibold text-ink">Explore</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { to: '/surahs', label: 'Surahs', icon: Library, sub: '114 Surahs' },
            { to: '/juz', label: 'Juz', icon: Compass, sub: '30 Juz' },
            { to: '/mushaf', label: 'Mushaf', icon: BookOpen, sub: '604 Pages' },
            { to: '/daily-ayah', label: 'Daily Ayah', icon: CalendarCheck, sub: 'Verse of the day' },
          ].map(({ to, label, icon: Icon, sub }) => (
            <Link
              key={to}
              to={to}
              className="card group flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <p className="text-sm font-semibold text-ink">{label}</p>
              <p className="text-xs text-ink-faint">{sub}</p>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* ── Surah Explorer Preview ──────────────────────────────────────────── */}
      {surahsError ? (
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce}>
          <ErrorState
            title="Couldn't load the surah list"
            message={surahsError}
            onRetry={reloadSurahs}
          />
        </motion.section>
      ) : (
      featuredSurahs.length > 0 && (
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Browse Surahs</h2>
            <Link to="/surahs" className="text-sm font-semibold text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {featuredSurahs.map((surah) => (
              <Link
                key={surah.number}
                to={`/surah/${surah.number}`}
                className="card group flex items-center gap-4 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-[var(--shadow-glow)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-sm font-bold text-brand transition-colors group-hover:bg-gold group-hover:text-white">
                  {surah.number}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{surah.nameTransliterated}</p>
                  <p className="text-xs text-ink-muted">
                    {surah.nameTranslation} · {surah.numberOfAyahs} ayahs
                  </p>
                </div>
                <p
                  className="arabic-heading text-lg text-ink-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-gold"
                  lang="ar"
                  dir="rtl"
                  translate="no"
                >
                  {surah.nameArabic}
                </p>
              </Link>
            ))}
          </div>
        </motion.section>
      )
      )}

      {/* ── Featured Recitations ────────────────────────────────────────────── */}
      <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce}>
        <h2 className="mb-4 text-lg font-semibold text-ink">Featured Recitations</h2>
        <motion.div variants={staggerContainer} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { surah: 1, label: 'Al-Fatihah', subtitle: 'The Opening' },
            { surah: 36, label: 'Ya-Sin', subtitle: 'The Heart of the Quran' },
            { surah: 55, label: 'Ar-Rahman', subtitle: 'The Beneficent' },
            { surah: 67, label: 'Al-Mulk', subtitle: 'The Sovereignty' },
            { surah: 112, label: 'Al-Ikhlas', subtitle: 'The Sincerity' },
            { surah: 114, label: 'An-Nas', subtitle: 'Mankind' },
          ].map(({ surah, label, subtitle }) => {
            const playingThis = mode === 'surah' && currentAyah?.surahNumber === surah
            return (
              <motion.div
                key={surah}
                variants={fadeUp}
                className="card group flex items-center gap-4 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-[var(--shadow-glow)]"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (playingThis) {
                      if (playing) pause()
                      else resume()
                    } else {
                      playSurah(surah)
                    }
                  }}
                  aria-label={
                    playingThis && playing
                      ? `Pause surah ${surah}`
                      : `Play surah ${surah}`
                  }
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
                    playingThis
                      ? 'bg-gold text-white shadow-md'
                      : 'bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white'
                  }`}
                >
                  {playingThis && playing ? (
                    <EqualizerBars />
                  ) : (
                    <Play className="h-4 w-4" aria-hidden />
                  )}
                </button>
                <Link to={`/surah/${surah}`} className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="text-xs text-ink-faint">{subtitle}</p>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.section>

      {/* ── Bookmarks Summary ───────────────────────────────────────────────── */}
      {bookmarks.length > 0 && (
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Your Bookmarks</h2>
            <Link to="/bookmarks" className="text-sm font-semibold text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="card flex items-center gap-3 rounded-2xl p-5">
            <Bookmark className="h-5 w-5 text-gold" aria-hidden />
            <p className="text-sm text-ink-muted">
              You have <span className="font-semibold text-ink">{bookmarks.length}</span> bookmark{bookmarks.length !== 1 ? 's' : ''}
            </p>
          </div>
        </motion.section>
      )}

      {/* ── Your Quran Journey ─────────────────────────────────────────────── */}
      <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Your Quran Journey</h2>
          <Link
            to={`/mushaf/${continuePage}`}
            className="text-sm font-semibold text-brand hover:underline"
          >
            Continue reading →
          </Link>
        </div>
        <motion.div variants={staggerContainer} className="grid gap-3 sm:grid-cols-3">
          {journeyStats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="card rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <stat.icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium tracking-wide text-ink-faint uppercase">
                    {stat.label}
                  </p>
                  <p className="text-sm font-semibold text-ink tabular-nums">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line/60" aria-hidden>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${stat.pct}%` }}
                  viewport={viewportOnce}
                  transition={{ type: 'spring', stiffness: 60, damping: 18, delay: stat.delay }}
                  className="h-full rounded-full bg-gradient-to-r from-brand via-brand to-gold"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </motion.div>
  )
}