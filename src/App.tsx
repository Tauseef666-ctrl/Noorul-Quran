import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { getActiveProvider } from './services/quran'
import { getTranslationsForAyah } from './services/quran/alQuranCloudProvider'
import type { SurahDetail } from './types/quran'
import { ThemeToggle } from './components/ThemeToggle'
import { ArabicSizeSelector } from './components/ArabicSizeSelector'

const SHOWCASE_SURAH = 112 // Al-Ikhlas — short, ideal for design review

export default function App() {
  const [surah, setSurah] = useState<SurahDetail | null>(null)
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false
    ;(async () => {
      try {
        const detail = await getActiveProvider().getSurah(SHOWCASE_SURAH)
        if (cancelled) return
        setSurah(detail)
        const entries = await Promise.all(
          detail.ayahs.map(async (ayah) => [
            ayah.key,
            await getTranslationsForAyah(
              ayah.surahNumber,
              ayah.ayahNumber,
              ['en.sahih', 'ur.jalandhry'],
              controller.signal,
            ),
          ]),
        )
        if (!cancelled) setTranslations(Object.fromEntries(entries))
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Failed to load.')
        }
      }
    })()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-5 py-10 sm:py-14">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <BookOpen className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="arabic-heading text-2xl leading-none" lang="ar" dir="rtl">
              نور القرآن
            </p>
            <p className="mt-1 text-sm font-medium tracking-wide">
              Noorul<span className="text-gold">Quran</span>
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {error && (
        <div role="alert" className="card rounded-2xl p-5 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {surah && (
        <section aria-label={`Surah ${surah.nameTransliterated}`} className="card rounded-3xl px-6 py-8 sm:px-10 sm:py-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Surah {surah.number} · {surah.revelationType}
            </p>
            <h1 className="arabic-heading mt-2 text-4xl" lang="ar" dir="rtl">
              {surah.nameArabic}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {surah.nameTransliterated} — {surah.nameTranslation}
              {surah.nameTranslationUrdu ? ` · ${surah.nameTranslationUrdu}` : ''}
            </p>
            <div className="gold-divider mx-auto mt-6 w-40" />
          </div>

          <ol className="mt-8 space-y-10">
            {surah.ayahs.map((ayah) => (
              <li key={ayah.key} className="space-y-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="quran-text text-right" lang="ar" dir="rtl">
                    {ayah.arabic}
                  </p>
                  <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[11px] font-semibold text-ink-faint">
                    {ayah.surahNumber}:{ayah.ayahNumber}
                  </span>
                </div>
                {translations[ayah.key]?.['en.sahih'] && (
                  <p className="translation-en text-[15px] leading-relaxed text-ink-muted">
                    {translations[ayah.key]['en.sahih']}
                  </p>
                )}
                {translations[ayah.key]?.['ur.jalandhry'] && (
                  <p className="translation-ur text-right text-base" lang="ur" dir="rtl">
                    {translations[ayah.key]['ur.jalandhry']}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <ArabicSizeSelector />
        <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">
          Phase 3 — design system live
        </p>
      </footer>
    </main>
  )
}
