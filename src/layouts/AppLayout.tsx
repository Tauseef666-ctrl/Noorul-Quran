import { NavLink, useLocation, useOutlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  Home,
  Library,
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
import { ArabicSizeSelector } from '../components/ArabicSizeSelector'
import { UiSizeSelector } from '../components/UiSizeSelector'
import { AudioPlayer } from '../components/AudioPlayer'
import { AppFooter } from '../components/AppFooter'
import { AmbientBackground } from '../components/AmbientBackground'
import { useAudio } from '../store/audio'
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
  { to: '/surahs', label: 'Surahs', Icon: Library },
  { to: '/juz', label: 'Juz', Icon: BookOpen },
  { to: '/mushaf', label: 'Mushaf', Icon: Compass },
  { to: '/search', label: 'Search', Icon: Search },
  { to: '/daily-ayah', label: 'Daily Ayah', Icon: CalendarCheck },
  { to: '/bookmarks', label: 'Bookmarks', Icon: Bookmark },
  { to: '/notes', label: 'Notes', Icon: StickyNote },
  { to: '/listen', label: 'Listen', Icon: Radio },
  { to: '/tafsir', label: 'Tafsir', Icon: BookMarked },
  { to: '/plans', label: 'Plans', Icon: CalendarCheck },
  { to: '/settings', label: 'Settings', Icon: Settings },
  { to: '/sources', label: 'Sources', Icon: Info },
  { to: '/about', label: 'About', Icon: Info },
]

const MOBILE_BOTTOM: NavItem[] = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/surahs', label: 'Surahs', Icon: Library },
  { to: '/search', label: 'Search', Icon: Search },
  { to: '/bookmarks', label: 'Bookmarks', Icon: Bookmark },
  { to: '/settings', label: 'More', Icon: Menu },
]

/** Routes ordered longest-first so prefix matching picks the correct page title. */
const ROUTE_TITLES: Array<[string, string]> = [
  ['/daily-ayah', 'Daily Ayah'],
  ['/bookmarks', 'Bookmarks'],
  ['/sources', 'Sources & Attribution'],
  ['/settings', 'Settings'],
  ['/mushaf', 'Mushaf'],
  ['/surahs', 'Surahs'],
  ['/search', 'Search'],
  ['/listen', 'Recitations'],
  ['/tafsir', 'Tafsir'],
  ['/plans', 'Reading Plans'],
  ['/notes', 'Notes'],
  ['/juz', 'Juz'],
  ['/about', 'About'],
  ['/surah', 'Surah Reader'],
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
    const match = ROUTE_TITLES.find(([prefix]) => location.pathname.startsWith(prefix))
    document.title = match ? `${match[1]} · NoorulQuran` : 'NoorulQuran'
  }, [location.pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {outlet}
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
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-md">
            <BookOpen className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="arabic-heading text-lg leading-none" lang="ar" dir="rtl" translate="no">
              نور القرآن
            </p>
            <p className="mt-0.5 text-xs font-medium text-ink-muted">
              Noorul<span className="text-gold">Quran</span>
            </p>
          </div>
        </div>

        <motion.nav
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2"
          aria-label="Sidebar navigation"
        >
          {DESKTOP_NAV.map((item) => (
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
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <BookOpen className="h-4 w-4" aria-hidden />
          </span>
          <p className="arabic-heading text-base leading-none" lang="ar" dir="rtl" translate="no">
            نور القرآن
          </p>
        </div>
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