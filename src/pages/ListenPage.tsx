import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Headphones } from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import { CURATED_RECITERS } from '../services/quran/audioProvider'
import type { Surah } from '../types/quran'
import { useAsyncData } from '../hooks/useAsyncData'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.03 } },
}

export default function ListenPage() {
  const { data: surahs, loading } = useAsyncData<Surah[]>(
    (signal) => getActiveProvider().getSurahList({ signal }),
    [],
  )

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.header variants={fadeIn}>
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-brand" aria-hidden />
          <h1 className="text-2xl font-bold text-ink">Listen</h1>
        </div>
        <p className="text-sm text-ink-muted">Audio-first Quran browsing</p>
      </motion.header>

      {/* Reciter info */}
      <motion.section variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Available Reciters</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Select a reciter when playing audio. Full playback controls available in Phase 9.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CURATED_RECITERS.map((reciter) => (
            <div
              key={reciter.id}
              className="flex items-center gap-3 rounded-xl border border-line p-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Play className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink truncate">{reciter.name}</p>
                <p className="text-[10px] text-ink-faint">{reciter.bitrate} kbps</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Surah list for quick play */}
      <motion.section variants={fadeIn}>
        <h2 className="mb-3 text-sm font-semibold text-ink">Quick Play — Surahs</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-line" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-24 rounded bg-line" />
                    <div className="h-2 w-16 rounded bg-line" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : surahs && (
          <motion.div variants={stagger} className="space-y-1.5">
            {surahs.map((surah) => (
              <motion.div key={surah.number} variants={fadeIn}>
                <Link
                  to={`/surah/${surah.number}`}
                  className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <Play className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-ink truncate">
                      {surah.number}. {surah.nameTransliterated}
                    </p>
                    <p className="text-[10px] text-ink-faint">
                      {surah.numberOfAyahs} ayahs · {surah.revelationType}
                    </p>
                  </div>
                  <p className="arabic-heading text-sm text-ink-faint" lang="ar" dir="rtl">
                    {surah.nameArabic}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>
    </motion.div>
  )
}
