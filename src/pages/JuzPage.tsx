import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { getActiveProvider } from '../services/quran'
import type { Surah } from '../types/quran'
import { AYAH_COUNTS } from '../data/ayahCounts'
import { fadeUp, staggerContainer } from '../animations'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.03 } },
}

interface JuzInfo {
  number: number
  startSurah: number
  startAyah: number
  endSurah: number
  endAyah: number
  ayahCount: number
}

// Pre-computed juz boundaries (standard Madinah mushaf)
const JUZ_BOUNDARIES: Omit<JuzInfo, 'ayahCount'>[] = [
  { number: 1, startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { number: 2, startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  { number: 3, startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  { number: 4, startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23 },
  { number: 5, startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
  { number: 6, startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81 },
  { number: 7, startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110 },
  { number: 8, startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
  { number: 9, startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
  { number: 10, startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
  { number: 11, startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
  { number: 12, startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
  { number: 13, startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
  { number: 14, startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
  { number: 15, startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
  { number: 16, startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
  { number: 17, startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
  { number: 18, startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
  { number: 19, startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
  { number: 20, startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
  { number: 21, startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
  { number: 22, startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
  { number: 23, startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
  { number: 24, startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
  { number: 25, startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
  { number: 26, startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
  { number: 27, startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
  { number: 28, startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 8 },
  { number: 29, startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
  { number: 30, startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
]

function computeJuzInfos(surahs: Surah[]): JuzInfo[] {
  return JUZ_BOUNDARIES.map((juz) => {
    let count = 0
    for (let s = juz.startSurah; s <= juz.endSurah; s++) {
      const meta = surahs.find((surah) => surah.number === s)
      if (!meta) continue
      if (s === juz.startSurah && s === juz.endSurah) {
        count += juz.endAyah - juz.startAyah + 1
      } else if (s === juz.startSurah) {
        count += (meta?.numberOfAyahs ?? (AYAH_COUNTS[s - 1] ?? 0)) - juz.startAyah + 1
      } else if (s === juz.endSurah) {
        count += juz.endAyah
      } else {
        count += AYAH_COUNTS[s - 1] ?? meta?.numberOfAyahs ?? 0
      }
    }
    return { ...juz, ayahCount: count }
  })
}

export default function JuzPage() {
  const [juzInfos, setJuzInfos] = useState<JuzInfo[]>([])
  const [surahMap, setSurahMap] = useState<Map<number, Surah>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    getActiveProvider().then((provider) =>
      provider.getSurahList().then((list) => {
        if (cancelled) return
        const map = new Map(list.map((s) => [s.number, s]))
        setSurahMap(map)
        setJuzInfos(computeJuzInfos(list))
        setLoading(false)
      }),
    )

    return () => { cancelled = true }
  }, [])

  const getSurahName = (num: number) => surahMap.get(num)?.nameTransliterated ?? `Surah ${num}`

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.header variants={fadeIn}>
        <h1 className="text-2xl font-bold text-ink">Juz</h1>
        <p className="text-sm text-ink-muted">30 parts of the Holy Quran</p>
      </motion.header>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card animate-pulse rounded-2xl p-5">
              <div className="h-6 w-20 rounded bg-line" />
              <div className="mt-2 h-4 w-40 rounded bg-line" />
              <div className="mt-2 h-3 w-32 rounded bg-line" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div variants={staggerContainer} className="grid gap-3 sm:grid-cols-2">
          {juzInfos.map((juz) => (
            <motion.div key={juz.number} variants={fadeUp}>
              <Link
                to={`/juz/${juz.number}`}
                className="card group block rounded-2xl p-5 transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-[var(--shadow-glow)] active:scale-[0.99]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      Juz {juz.number}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ink">
                      {getSurahName(juz.startSurah)} {juz.startSurah}:{juz.startAyah}
                    </p>
                    <p className="text-xs text-ink-muted">
                      → {getSurahName(juz.endSurah)} {juz.endSurah}:{juz.endAyah}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-faint">
                      {juz.ayahCount} ayahs
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-brand transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100 opacity-40" />
                </div>
                <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-line/60">
                  <div
                    className="h-full w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-brand/50 to-gold/60 transition-transform duration-500 group-hover:scale-x-100"
                    aria-hidden
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
