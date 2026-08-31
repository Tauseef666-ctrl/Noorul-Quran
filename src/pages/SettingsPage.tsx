import { motion } from 'framer-motion'
import { Smartphone, Download } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { ArabicSizeSelector } from '../components/ArabicSizeSelector'
import { UiSizeSelector } from '../components/UiSizeSelector'
import { TranslationSelector } from '../components/TranslationSelector'
import { usePreferences } from '../store/preferences'
import { useAudio } from '../store/audio'
import { useTranslations } from '../store/translations'
import { CURATED_RECITERS } from '../services/quran/audioProvider'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
}

export default function SettingsPage() {
  const { arabicSize, uiSize } = usePreferences()
  const { reciterId, setReciter } = useAudio()
  const { activeEditions } = useTranslations()

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      <motion.header variants={fadeIn}>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-ink-muted">Customize your reading experience</p>
      </motion.header>

      <motion.section variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Theme</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Choose between light, dark, or system preference
        </p>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </motion.section>

      <motion.section variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Interface Text Size</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Adjust the size of the app interface and translated text
        </p>
        <div className="mt-4">
          <UiSizeSelector />
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Current: {uiSize}
        </p>
      </motion.section>

      <motion.section variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Arabic Text Size</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Adjust the size of the Quranic Arabic text
        </p>
        <div className="mt-4">
          <ArabicSizeSelector />
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Current: {arabicSize}
        </p>
      </motion.section>

      <motion.section variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Audio Reciter</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Select your preferred reciter for audio playback
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {CURATED_RECITERS.map((reciter) => {
            const isActive = reciterId === reciter.id
            return (
              <button
                key={reciter.id}
                type="button"
                onClick={() => setReciter(reciter.id)}
                aria-pressed={isActive}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  isActive
                    ? 'border-brand bg-brand/5'
                    : 'border-line hover:border-brand/40 hover:bg-brand/5'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                    isActive ? 'bg-brand text-white' : 'bg-brand/10 text-brand'
                  }`}
                >
                  {reciter.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink">{reciter.name}</p>
                  <p className="text-[10px] text-ink-faint">
                    {reciter.bitrate} kbps{isActive ? ' · selected' : ''}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Audio is streamed on demand from the islamic.network CDN.
        </p>
      </motion.section>

      <motion.section variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Translations</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Choose which published translations appear under each verse
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand tabular-nums">
            {activeEditions.length} active
          </span>
        </div>
        <div className="mt-4">
          <TranslationSelector />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          Published translations are streamed from the Al Quran Cloud catalogue. Vetted text is
          marked <code className="rounded bg-line/40 px-1">translate="no"</code> so your browser will
          not auto-translate it. Copyright in each translation remains with its publisher — the
          Arabic is always shown in the original Uthmani script.
        </p>
      </motion.section>

      <motion.section variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Data</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Cache and local storage management
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear all cached data? This will not delete your bookmarks or reading progress.')) {
                import('../services/http').then(({ clearHttpCache }) => {
                  clearHttpCache()
                  window.location.reload()
                })
              }
            }}
            className="rounded-xl border border-line px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-red-400 hover:text-red-600"
          >
            Clear API Cache
          </button>
        </div>
      </motion.section>

      <motion.section variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-gold" aria-hidden />
          <h2 className="text-sm font-semibold text-ink">Install on Android (PWA)</h2>
        </div>
        <p className="mt-1 text-xs text-ink-muted">
          NoorulQuran is a progressive web app. Install it on your Android phone or tablet and it
          runs from your home screen, with offline caching and its own app window.
        </p>
        <ol className="mt-4 space-y-2 text-xs text-ink-muted">
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
              1
            </span>
            Open NoorulQuran in Chrome (or another Chromium browser) on Android.
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
              2
            </span>
            Tap the browser menu (⋮) and choose <strong>“Add to Home screen”</strong>, or confirm
            the <strong>“Install app”</strong> prompt that appears.
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
              3
            </span>
            Launch it from your home screen — it opens full-screen as its own app and stays updated
            automatically.
          </li>
        </ol>
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-faint">
          <Download className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
          For a static, offline bundle of this release, download the ZIP from the GitHub Releases
          page and serve the files from any web server (or open the PWA hosted online).
        </p>
      </motion.section>
    </motion.div>
  )
}
