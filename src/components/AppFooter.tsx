import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, ChevronDown, HeartHandshake } from 'lucide-react'
import { GeometricPattern } from './GeometricPattern'
import { LogoLockup } from './Brand'
import { fadeUp, staggerContainer } from '../animations'

const LINK_GROUPS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Quran',
    links: [
      { label: 'Surahs', to: '/surahs' },
      { label: 'Mushaf', to: '/mushaf' },
      { label: 'Juz', to: '/juz' },
      { label: 'Daily Ayah', to: '/daily-ayah' },
    ],
  },
  {
    title: 'Listen & Explore',
    links: [
      { label: 'Recitations', to: '/listen' },
      { label: 'Search', to: '/search' },
      { label: 'Bookmarks', to: '/bookmarks' },
      { label: 'Reading Plans', to: '/plans' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Notes', to: '/notes' },
      { label: 'Sources & Attribution', to: '/sources' },
      { label: 'About', to: '/about' },
    ],
  },
]

export function AppFooter() {
  const [duaOpen, setDuaOpen] = useState(false)

  return (
    <motion.footer
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="relative mt-12 overflow-hidden rounded-3xl border border-gold/15 bg-surface/50 p-8 backdrop-blur-xl sm:p-10"
    >
      <GeometricPattern
        variant="gold"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 w-full object-cover"
        opacity={0.22}
      />

      <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <LogoLockup />
          <p className="mt-2 text-xs tracking-wide text-ink-muted italic">
            Read. Listen. Reflect.
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            Created by Tauseef Khan
          </p>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-ink-faint">
            A mindful Quran reader — transparent as to its sources, faithful to the
            canonical text, and free of fabricated or AI-generated content.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href="https://github.com/Tauseef666-ctrl/Noorul-Quran"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-ink-muted transition-colors hover:text-brand"
            >
              <Code className="h-4 w-4" aria-hidden />
              Source on GitHub
            </a>
            <button
              type="button"
              onClick={() => setDuaOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium text-gold/80 transition-colors hover:text-gold"
              aria-expanded={duaOpen}
              aria-controls="footer-personal-dua"
            >
              Personal Dua
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${duaOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
          </div>

          {/* Personal Dua — revealed in place; no navigation, no route change */}
          <AnimatePresence initial={false}>
            {duaOpen && (
              <motion.div
                key="footer-personal-dua"
                id="footer-personal-dua"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
                className="mt-4 max-w-md overflow-hidden rounded-2xl border border-gold/25 bg-surface-opaque/80 p-5"
              >
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                  <HeartHandshake className="h-3.5 w-3.5" aria-hidden />
                  Personal Dua
                  <span className="font-medium normal-case tracking-wide text-ink-faint">
                    · not Quranic text
                  </span>
                </p>
                <blockquote
                  lang="ar"
                  dir="rtl"
                  translate="no"
                  className="arabic-heading mt-3 border-r-2 border-gold/40 pr-4 text-right text-lg leading-loose text-ink"
                >
                  اللَّهُمَّ اجْعَلْ هَٰذَا الْعَمَلَ خَالِصًا لِوَجْهِكَ الْكَرِيمِ،
                  وَانْفَعْ بِهِ كُلَّ مَنْ قَرَأَ، وَارْزُقْنَا الْإِخْلَاصَ وَالْقَبُولَ
                </blockquote>
                <p className="mt-3 text-xs italic leading-relaxed text-ink-faint">
                  (Transliteration: &ldquo;O Allah, make this work purely for Your noble
                  Countenance, benefit through it everyone who reads, and grant us
                  sincerity and acceptance.&rdquo;)
                </p>
                <p className="mt-2 text-xs text-ink-faint">
                  Built with love for the sake of Allah ·{' '}
                  <span className="num-ltr">Created by Tauseef Khan</span>
                </p>
                <Link
                  to="/sources#personal-dua"
                  className="mt-3 block border-t border-line/60 pt-3 text-[11px] font-medium text-brand hover:underline"
                >
                  Why we label it → Sources &amp; Attribution
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Link groups */}
        {LINK_GROUPS.map((group) => (
          <motion.nav key={group.title} variants={fadeUp} aria-label={`Footer: ${group.title}`}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
              {group.title}
            </p>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-muted transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        ))}
      </div>

      <div className="relative mt-10 flex flex-col items-center justify-between gap-3 border-t border-line/60 pt-6 sm:flex-row">
        <p className="text-center text-[11px] text-ink-faint">
          Quran text © Tanzil Project. Translations & tafsir remain the property of their
          respective translators & scholars, used here with attribution. Recitations remain the
          property of their reciters.
        </p>
        <div className="flex shrink-0 items-center gap-4">
          <Link
            to="/sources"
            className="text-[11px] font-medium text-ink-faint transition-colors hover:text-brand"
          >
            Data & Attribution
          </Link>
          <span className="text-[11px] tabular-nums text-ink-faint">
            نور القرآن © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </motion.footer>
  )
}