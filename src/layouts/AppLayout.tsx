import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useMemo, useState } from 'react'
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
} from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { ArabicSizeSelector } from '../components/ArabicSizeSelector'

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

function SidebarLink({ to, label, Icon }: NavItem) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
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

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Close mobile menu when pathname changes — derived, no effect needed
  const menuKey = useMemo(() => location.pathname, [location.pathname])

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-line lg:bg-surface/50">
        <div className="flex items-center gap-3 px-6 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <BookOpen className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="arabic-heading text-lg leading-none" lang="ar" dir="rtl">
              نور القرآن
            </p>
            <p className="mt-0.5 text-xs font-medium text-ink-muted">
              Noorul<span className="text-gold">Quran</span>
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-2" aria-label="Sidebar navigation">
          {DESKTOP_NAV.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="border-t border-line px-4 py-4">
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-line bg-paper/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <BookOpen className="h-4 w-4" aria-hidden />
          </span>
          <p className="arabic-heading text-base leading-none" lang="ar" dir="rtl">
            نور القرآن
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-brand/5 hover:text-ink"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile slide-out menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-line bg-paper p-4 pt-20 shadow-xl lg:hidden">
            <nav aria-label="Mobile navigation" className="space-y-0.5">
              {DESKTOP_NAV.map((item) => (
                <SidebarLink key={item.to} {...item} />
              ))}
            </nav>
            <div className="mt-6 border-t border-line pt-4">
              <ArabicSizeSelector />
            </div>
          </div>
        </>
      )}

      {/* Main content — key forces remount on route change, auto-closes menu */}
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-16 lg:px-8 lg:pt-6">
          <Outlet key={menuKey} />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line bg-paper/90 px-2 py-1.5 backdrop-blur-md lg:hidden"
        aria-label="Mobile bottom navigation"
      >
        {MOBILE_BOTTOM.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-brand'
                  : 'text-ink-faint hover:text-ink-muted'
              }`
            }
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
