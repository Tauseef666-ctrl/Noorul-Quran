import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookMarked, Loader2 } from 'lucide-react'
import { getActiveProvider } from '../services/quran'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function TafsirPage() {
  const [surahNum, setSurahNum] = useState(1)
  const [ayahNum, setAyahNum] = useState(1)
  const [tafsirText, setTafsirText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    const provider = getActiveProvider()
    if (!provider.getTafsir) {
      setError('Tafsir is not available with the current provider.')
      return
    }

    setLoading(true)
    setError(null)
    setTafsirText('')

    try {
      const result = await provider.getTafsir(surahNum, ayahNum, 'en.jalalayn')
      setTafsirText(result.text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tafsir.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      <motion.header variants={fadeIn}>
        <div className="flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-gold" aria-hidden />
          <h1 className="text-2xl font-bold text-ink">Tafsir</h1>
        </div>
        <p className="text-sm text-ink-muted">
          Commentary on Quranic verses — clearly separated from the Quran text
        </p>
      </motion.header>

      <motion.div variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Select a Verse</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Tafsir is scholarly commentary and is never presented as Quranic text
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="tafsir-surah" className="mb-1 block text-xs text-ink-faint">Surah</label>
            <input
              id="tafsir-surah"
              type="number"
              min={1}
              max={114}
              value={surahNum}
              onChange={(e) => setSurahNum(Number(e.target.value))}
              className="w-20 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="tafsir-ayah" className="mb-1 block text-xs text-ink-faint">Ayah</label>
            <input
              id="tafsir-ayah"
              type="number"
              min={1}
              max={300}
              value={ayahNum}
              onChange={(e) => setAyahNum(Number(e.target.value))}
              className="w-20 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'View Tafsir'}
          </button>
        </div>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading tafsir…
        </div>
      )}

      {error && (
        <div className="card rounded-2xl p-5 text-sm text-red-700 dark:text-red-300" role="alert">
          {error}
        </div>
      )}

      {tafsirText && (
        <motion.div variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
          <div className="mb-3 rounded-xl bg-gold/5 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Tafsir · Surah {surahNum}:{ayahNum} · Jalalayn
            </p>
          </div>
          <p className="text-sm leading-relaxed text-ink-muted">{tafsirText}</p>
          <div className="mt-4 border-t border-line pt-3 text-center">
            <p className="text-[10px] text-ink-faint italic">
              This is scholarly tafsir (commentary), not Quranic text.
            </p>
          </div>
        </motion.div>
      )}

      {!loading && !tafsirText && !error && (
        <motion.div variants={fadeIn} className="py-12 text-center">
          <BookMarked className="mx-auto h-10 w-10 text-ink-faint/40" />
          <p className="mt-3 text-sm text-ink-muted">
            Select a verse above to view its tafsir
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
