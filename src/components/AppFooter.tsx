import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code } from 'lucide-react'
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
            <Link
              to="/sources#personal-dua"
              className="text-xs font-medium text-gold/80 transition-colors hover:text-gold"
            >
              Personal Dua
            </Link>
          </div>
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