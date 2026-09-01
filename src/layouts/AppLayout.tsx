import { NavLink, useLocation, useOutlet } from 'react-router-dom'
import { Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  Home,
  Search,
  Bookmark,
  Settings,
  Info,
  Radio,
  Menu,
  X,
  CalendarCheck,
  BookMarked,
  Compass,
  StickyNote,
} from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { LogoLockup } from '../components/Brand'
import { ArabicSizeSelector } from '../components/ArabicSizeSelector'
import { UiSizeSelector } from '../components/UiSizeSelector'
import { AudioPlayer } from '../components/AudioPlayer'
import { AppFooter } from '../components/AppFooter'
import { AmbientBackground } from '../components/AmbientBackground'
import { LoadingScreen } from '../components/LoadingScreen'
import { useAudio } from '../store/audio'
import { applyPageMeta } from '../lib/documentMeta'
import {
  pageTransition,
  drawerEnter,
  staggerContainer,
  fadeUp,
} from '../animations'

interface NavItem {
  to: string
  label: string
  Icon: typeof Home
}

const DESKTOP_NAV: NavItem[] = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/surahs', label: 'Quran', Icon: BookMarked },
  { to: '/mushaf', label: 'Read', Icon: BookOpen },
  { to: '/listen', label: 'Listen', Icon: Radio },
  { to: '/juz', label: 'Juz', Icon: Compass },
  { to: '/search', label: 'Search', Icon: Search },
]

/** Secondary/user section — grouped beneath the primary nav. */
const SECONDARY_NAV: NavItem[] = [
  { to: '/bookmarks', label: 'Bookmarks', Icon: Bookmark },
  { to: '/daily-ayah', label: 'Daily Ayah', Icon: CalendarCheck },
  { to: '/plans', label: 'Reading Plan', Icon: CalendarCheck },
  { to: '/notes', label: 'Notes', Icon: StickyNote },
  { to: '/tafsir', label: 'Tafsir', Icon: BookMarked },
  { to: '/sources', label: 'Resources', Icon: Info },
  { to: '/about', label: 'About', Icon: Info },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

const MOBILE_BOTTOM: NavItem[] = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/surahs', label: 'Quran', Icon: BookMarked },
  { to: '/search', label: 'Search', Icon: Search },
  { to: '/bookmarks', label: 'Bookmarks', Icon: Bookmark },
  { to: '/settings', label: 'More', Icon: Menu },
]

/** Routes ordered longest-first so prefix matching picks the correct metadata. */
const ROUTE_META: Array<[string, string, string]> = [
  ['/daily-ayah', 'Daily Ayah', 'Today’s verse of the Quran with Arabic, translation, and recitation at your fingertips.'],
  ['/bookmarks', 'Bookmarks', 'Your saved Quran verses, gathered in one place for quick reference.'],
  ['/sources', 'Sources & Attribution', 'Every Quran text, translation, tafsir, recitation, font, and API behind NoorulQuran — credited and licensed.'],
  ['/settings', 'Settings', 'Customize NoorulQuran — theme, reciter, translations, tafsir, and interface size.'],
  ['/mushaf', 'Mushaf', 'Read the Quran page by page in a serene digital Mushaf with swipes and jump-to-page navigation.'],
  ['/surahs', 'Surahs', 'Browse all 114 surahs of the Quran, each with its ayat and recitation.'],
  ['/search', 'Search', 'Search the Quran — Arabic verses, translations, surah names, and references.'],
  ['/listen', 'Recitations', 'Stream beautiful Quran recitations, surah by surah, from vetted reciters.'],
  ['/tafsir', 'Tafsir', 'Verse-by-verse Quran commentary (tafsir) from published classical and modern scholars.'],
  ['/plans', 'Reading Plans', 'Guided Quran reading plans — 30-day, 60-day, or your own custom pace, with daily tracking.'],
  ['/notes', 'Notes', 'Your personal notes on the Quran, attached ayah by ayah.'],
  ['/juz', 'Juz', 'Explore the Quran by juz — all 30 parts with clean section reading.'],
  ['/about', 'About', 'The story, principles, and technology behind NoorulQuran.'],
  ['/surah', 'Surah Reader', 'Read a full surah with Arabic, translations, and recitation — ayah by ayah.'],
  ['/', 'Read. Listen. Reflect.', 'NoorulQuran — a peaceful digital Mushaf and modern Quran study companion. Read, listen, and reflect.'],
]

function SidebarLink({
  to,
  label,
  Icon,
  onNavigate,
}: NavItem & { onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={() => onNavigate?.()}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand/10 text-brand'
            : 'text-ink-muted hover:bg-brand/5 hover:text-ink'
        }`
      }
    >
      <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
      {label}
    </NavLink>
  )
}

/* Page shell — animates the routed page in/out on pathname change + sets the title */
function RoutedPage() {
  const outlet = useOutlet()
  const location = useLocation()

  useEffect(() => {
    const match = ROUTE_META.find(([prefix]) =>
      prefix === '/' ? location.pathname === '/' : location.pathname.startsWith(prefix),
    )
    if (match) {
      applyPageMeta({ title: `${match[1]} · NoorulQuran`, description: match[2], path: location.pathname })
    }
    if (location.hash) {
      const id = location.hash.replace('#', '')
      // wait a tick for the routed page to mount, then gently scroll to the anchor
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } else {
      // New route → start at the top of the page. Scrolls after the route
      // element mounts so the nav/footer transition doesn't fight it.
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      })
    }
  }, [location.pathname, location.hash])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Suspense
          fallback={
            // Keeps the nav/footer mounted while a lazily-split route chunk loads
            <LoadingScreen label="Loading…" />
          }
        >
          {outlet}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { currentAyah: activeAudio } = useAudio()

  return (
    <div className="flex min-h-screen">
      {/* Skip to content — first tab stop for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Meditative animated background (fixed, behind everything) */}
      <AmbientBackground />

      {/* Desktop sidebar — Glass 1 */}
      <aside className="glass-nav sticky top-0 hidden h-screen w-64 shrink-0 flex-col lg:flex lg:border-y-0 lg:border-l-0">
        <div className="px-6 py-6">
          <LogoLockup size="sm" />
        </div>

        <motion.nav
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex-1 space-y-0.5 overflow-y-auto px-3 py-1"
          aria-label="Sidebar navigation"
        >
          {DESKTOP_NAV.map((item) => (
            <motion.div key={item.to} variants={fadeUp}>
              <SidebarLink {...item} />
            </motion.div>
          ))}

          <div className="flex items-center gap-3 px-4 pb-1 pt-4" aria-hidden>
            <span className="h-px flex-1 bg-line/70" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink-faint">
              Library
            </span>
            <span className="h-px flex-1 bg-line/70" />
          </div>

          {SECONDARY_NAV.map((item) => (
            <motion.div key={item.to} variants={fadeUp}>
              <SidebarLink {...item} />
            </motion.div>
          ))}
        </motion.nav>

        <div className="border-t border-line/70 px-4 py-4">
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile header — Glass 1 */}
      <div className="glass-nav fixed inset-x-0 top-0 z-40 flex items-center justify-between border-x-0 border-t-0 px-4 py-2.5 lg:hidden">
        <LogoLockup size="sm" showArabic={false} />
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-brand/5 hover:text-ink"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          <motion.span
            key={mobileMenuOpen ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="flex"
            aria-hidden
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.span>
        </button>
      </div>

      {/* Mobile menu — glass drawer, none of it uses abrupt display toggling */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              key="drawer"
              variants={drawerEnter}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="glass-nav fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-y-0 border-l-0 p-4 pt-20 shadow-xl lg:hidden"
            >
              <nav
                id="mobile-navigation"
                aria-label="Mobile navigation"
                className="space-y-0.5"
              >
                {DESKTOP_NAV.map((item) => (
                  <SidebarLink
                    key={item.to}
                    {...item}
                    onNavigate={() => setMobileMenuOpen(false)}
                  />
                ))}
                <div className="flex items-center gap-3 px-4 pb-1 pt-4" aria-hidden>
                  <span className="h-px flex-1 bg-line/70" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink-faint">
                    Library
                  </span>
                  <span className="h-px flex-1 bg-line/70" />
                </div>
                {SECONDARY_NAV.map((item) => (
                  <SidebarLink
                    key={item.to}
                    {...item}
                    onNavigate={() => setMobileMenuOpen(false)}
                  />
                ))}
              </nav>
              <div className="mt-6 border-t border-line/70 pt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-faint">
                  Text size
                </p>
                <div className="space-y-2.5">
                  <UiSizeSelector />
                  <ArabicSizeSelector />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content — route transition + audio-aware bottom padding */}
      <main id="main-content" tabIndex={-1} className="relative min-w-0 flex-1 overflow-x-hidden">
        <div
          className={`mx-auto max-w-5xl px-4 pt-16 lg:px-8 lg:pt-8 ${
            activeAudio ? 'pb-56 lg:pb-36' : 'pb-24 lg:pb-10'
          }`}
        >
          <RoutedPage />
          <AppFooter />
        </div>
      </main>

      {/* Persistent bottom audio player */}
      <AudioPlayer />

      {/* Mobile bottom nav — Glass 1 */}
      <motion.nav
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="glass-nav fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-x-0 border-b-0 px-2 py-1.5 lg:hidden"
        aria-label="Mobile bottom navigation"
      >
        {MOBILE_BOTTOM.map(({ to, label, Icon }) => (
          <motion.div key={to} variants={fadeUp}>
            <NavLink
              to={to}
              end={to === '/'}
              className="relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors"
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 ${isActive ? 'text-brand' : 'text-ink-faint'}`}
                    aria-hidden
                  />
                  <span className={isActive ? 'text-brand' : 'text-ink-faint'}>
                    {label}
                  </span>
                  <span
                    className={`absolute -bottom-px h-0.5 w-6 rounded-full bg-gradient-to-r from-brand to-gold transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                    aria-hidden
                  />
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </motion.nav>
    </div>
  )
}