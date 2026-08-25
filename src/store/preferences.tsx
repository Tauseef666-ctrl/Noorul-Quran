import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeChoice = 'light' | 'dark' | 'system'
export type ArabicFontSize = 'small' | 'medium' | 'large'

const THEME_KEY = 'nq:theme'
const ARABIC_SIZE_KEY = 'nq:arabic-size'

interface Preferences {
  theme: ThemeChoice
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemeChoice) => void
  arabicSize: ArabicFontSize
  setArabicSize: (size: ArabicFontSize) => void
}

const PreferencesContext = createContext<Preferences | null>(null)

function readStoredTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    return 'system'
  }
  return 'system'
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function readStoredArabicSize(): ArabicFontSize {
  try {
    const stored = localStorage.getItem(ARABIC_SIZE_KEY)
    if (stored === 'small' || stored === 'medium' || stored === 'large') return stored
  } catch {
    return 'medium'
  }
  return 'medium'
}

function applyToDocument(theme: ThemeChoice, size: ArabicFontSize): void {
  const dark = theme === 'dark' || (theme === 'system' && systemPrefersDark())
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.setAttribute('data-arabic-size', size)
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>(readStoredTheme)
  const [arabicSize, setArabicSizeState] = useState<ArabicFontSize>(readStoredArabicSize)

  useEffect(() => {
    applyToDocument(theme, arabicSize)
  }, [theme, arabicSize])

  // Follow the OS while in "system" mode.
  useEffect(() => {
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyToDocument('system', arabicSize)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme, arabicSize])

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      return
    }
  }, [])

  const setArabicSize = useCallback((next: ArabicFontSize) => {
    setArabicSizeState(next)
    try {
      localStorage.setItem(ARABIC_SIZE_KEY, next)
    } catch {
      return
    }
  }, [])

  const value = useMemo<Preferences>(
    () => ({
      theme,
      resolvedTheme:
        theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme,
      setTheme,
      arabicSize,
      setArabicSize,
    }),
    [theme, arabicSize, setTheme, setArabicSize],
  )

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  )
}

export function usePreferences(): Preferences {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}
