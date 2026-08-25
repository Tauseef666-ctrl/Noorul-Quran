import { usePreferences, type ArabicFontSize } from '../store/preferences'

const SIZES: Array<{ value: ArabicFontSize; label: string }> = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

export function ArabicSizeSelector() {
  const { arabicSize, setArabicSize } = usePreferences()

  return (
    <div
      role="radiogroup"
      aria-label="Arabic text size"
      className="glass inline-flex items-center gap-1 rounded-full p-1"
    >
      {SIZES.map(({ value, label }) => {
        const active = arabicSize === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setArabicSize(value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? 'bg-brand text-white shadow-sm'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
