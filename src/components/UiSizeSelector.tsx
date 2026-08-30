import { usePreferences, type UiFontSize } from '../store/preferences'

const SIZES: Array<{ value: UiFontSize; label: string; hint: string }> = [
  { value: 'small', label: 'Small', hint: '0.93×' },
  { value: 'medium', label: 'Medium', hint: '1×' },
  { value: 'large', label: 'Large', hint: '1.1×' },
]

export function UiSizeSelector() {
  const { uiSize, setUiSize } = usePreferences()

  return (
    <div
      role="radiogroup"
      aria-label="Interface text size"
      className="glass inline-flex items-center gap-1 rounded-full p-1"
    >
      {SIZES.map(({ value, label, hint }) => {
        const active = uiSize === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            title={`${label} text (${hint})`}
            onClick={() => setUiSize(value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active ? 'bg-brand text-white shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}