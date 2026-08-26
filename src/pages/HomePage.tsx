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
import { AYAH_COUNTS } from '../data/ayahCounts'
import { useAsyncData } from '../hooks/useAsyncData'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
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

export default function HomePage() {
  const { data: surahs } = useAsyncData<Surah[]>(
    (signal) => getActiveProvider().getSurahList({ signal }),
    [],
  )

  const [dailyAyah, setDailyAyah] = useState<Ayah | null>(null)
  const [dailyTranslation, setDailyTranslation] = useState('')

  useEffect(() => {
    const provider = getActiveProvider()
    const controller = new AbortController()

    provider.getAyah(daily.surahNumber, daily.ayahNumber, { signal: controller.signal }).then((ayah) => {
      setDailyAyah(ayah)
    })

    import('../services/quran/alQuranCloudProvider').then(({ getTranslationsForAyah }) => {
      getTranslationsForAyah(daily.surahNumber, daily.ayahNumber, ['en.sahih'], controller.signal).then(
        (trans) => {
          setDailyTranslation(trans['en.sahih'] ?? '')
        },
      )
    })

    return () => controller.abort()
  }, [])

  const { progress } = useReadingProgress()
  const { bookmarks } = useBookmarks()

  const featuredSurahs = surahs?.slice(0, 6) ?? []

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-10">
      {/* Hero */}
      <motion.section variants={fadeIn} className="text-center py-10 sm:py-16">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand/10 text-brand">
          <BookOpen className="h-10 w-10" aria-hidden />
        </div>
        <h1
          className="arabic-heading text-5xl sm:text-6xl text-ink"
          lang="ar"
          dir="rtl"
        >
          نور القرآن
        </h1>
        <p className="mt-3 text-xl font-semibold text-ink">
          Noorul<span className="text-gold">Quran</span>
        </p>
        <p className="mt-2 text-sm tracking-wide text-ink-muted italic">
          Read. Listen. Reflect.
        </p>
        <div className="gold-divider mx-auto mt-6 w-32" />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/surahs"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-deep"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Read Quran
          </Link>
          <Link
            to="/listen"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-strong"
          >
            <Headphones className="h-4 w-4" aria-hidden />
            Listen to Quran
          </Link>
        </div>
      </motion.section>

      {/* Continue Reading */}
      {progress && (
        <motion.section variants={fadeIn}>
          <Link
            to={`/surah/${progress.surahNumber}?ayah=${progress.ayahNumber}`}
            className="card group block rounded-2xl p-5 transition-shadow hover:shadow-lg sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  Continue Reading
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">
                  Surah {progress.surahNumber} · Ayah {progress.ayahNumber}
                </p>
                <p className="text-sm text-ink-muted">Page {progress.page} · Juz {progress.juz}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-brand transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </motion.section>
      )}

      {/* Daily Ayah */}
      {dailyAyah && (
        <motion.section variants={fadeIn}>
          <div className="card rounded-2xl p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Ayah of the Day
              </p>
            </div>
            <p className="quran-text text-right" lang="ar" dir="rtl">
              {dailyAyah.arabic}
            </p>
            {dailyTranslation && (
              <p className="translation-en mt-4 text-[15px] leading-relaxed text-ink-muted">
                {dailyTranslation}
              </p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-faint">
                {dailyAyah.surahNumber}:{dailyAyah.ayahNumber}
              </span>
              <Link
                to={`/surah/${dailyAyah.surahNumber}?ayah=${dailyAyah.ayahNumber}`}
                className="text-xs font-semibold text-brand hover:underline"
              >
                Read full context →
              </Link>
            </div>
          </div>
        </motion.section>
      )}

      {/* Quick Explorers */}
      <motion.section variants={fadeIn}>
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
              className="card group flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-shadow hover:shadow-lg"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <p className="text-sm font-semibold text-ink">{label}</p>
              <p className="text-xs text-ink-faint">{sub}</p>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Surah Explorer Preview */}
      {featuredSurahs.length > 0 && (
        <motion.section variants={fadeIn}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Browse Surahs</h2>
            <Link
              to="/surahs"
              className="text-sm font-semibold text-brand hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {featuredSurahs.map((surah) => (
              <Link
                key={surah.number}
                to={`/surah/${surah.number}`}
                className="card group flex items-center gap-4 rounded-2xl p-4 transition-shadow hover:shadow-lg"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-sm font-bold text-brand">
                  {surah.number}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink truncate">{surah.nameTransliterated}</p>
                  <p className="text-xs text-ink-muted">
                    {surah.nameTranslation} · {surah.numberOfAyahs} ayahs
                  </p>
                </div>
                <p className="arabic-heading text-lg text-ink-faint" lang="ar" dir="rtl">
                  {surah.nameArabic}
                </p>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* Featured Recitations */}
      <motion.section variants={fadeIn}>
        <h2 className="mb-4 text-lg font-semibold text-ink">Featured Recitations</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { surah: 1, label: 'Al-Fatihah', subtitle: 'The Opening' },
            { surah: 36, label: 'Ya-Sin', subtitle: 'The Heart of the Quran' },
            { surah: 55, label: 'Ar-Rahman', subtitle: 'The Beneficent' },
            { surah: 67, label: 'Al-Mulk', subtitle: 'The Sovereignty' },
            { surah: 112, label: 'Al-Ikhlas', subtitle: 'The Sincerity' },
            { surah: 114, label: 'An-Nas', subtitle: 'Mankind' },
          ].map(({ surah, label, subtitle }) => (
            <Link
              key={surah}
              to={`/surah/${surah}`}
              className="card group flex items-center gap-3 rounded-2xl p-4 transition-shadow hover:shadow-lg"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <Play className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{label}</p>
                <p className="text-xs text-ink-faint">{subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Bookmarks Summary */}
      {bookmarks.length > 0 && (
        <motion.section variants={fadeIn}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Your Bookmarks</h2>
            <Link to="/bookmarks" className="text-sm font-semibold text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="card rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <Bookmark className="h-5 w-5 text-gold" aria-hidden />
              <p className="text-sm text-ink-muted">
                You have <span className="font-semibold text-ink">{bookmarks.length}</span> bookmark{bookmarks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* Footer */}
      <footer className="border-t border-line pt-8 pb-4 text-center">
        <p className="arabic-heading text-sm text-ink-faint" lang="ar" dir="rtl">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <p className="mt-2 text-xs text-ink-faint">
          NoorulQuran · Read. Listen. Reflect.
        </p>
      </footer>
    </motion.div>
  )
}
