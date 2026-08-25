import { Moon, Sun, Monitor } from 'lucide-react'
import { usePreferences, type ThemeChoice } from '../store/preferences'

const OPTIONS: Array<{ value: ThemeChoice; label: string; Icon: typeof Sun }> = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'dark', label: 'Dark', Icon: Moon },
]

export function ThemeToggle() {
  const { theme, setTheme } = usePreferences()

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="glass inline-flex items-center gap-1 rounded-full p-1"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? 'bg-brand text-white shadow-sm'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
          </button>
        )
      })}
    </div>
  )
}
