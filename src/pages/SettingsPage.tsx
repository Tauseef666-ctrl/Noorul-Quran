import { motion } from 'framer-motion'
import { ThemeToggle } from '../components/ThemeToggle'
import { ArabicSizeSelector } from '../components/ArabicSizeSelector'
import { usePreferences } from '../store/preferences'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
}

export default function SettingsPage() {
  const { arabicSize } = usePreferences()

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
        <p className="mt-4 text-xs text-ink-faint italic">
          Reciter selection will be available in Phase 9 (Audio Recitation System)
        </p>
      </motion.section>

      <motion.section variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Translations</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Manage which translations are displayed alongside the Arabic text
        </p>
        <p className="mt-4 text-xs text-ink-faint italic">
          Default: English (Saheeh International) + Urdu (Jalandhry)
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
    </motion.div>
  )
}
