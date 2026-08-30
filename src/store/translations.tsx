import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_TRANSLATION_IDS, TRANSLATION_CATALOG } from '../services/quran/translationProvider'
import type { TranslationEdition } from '../types/quran'

const TRANSLATIONS_KEY = 'nq:translations'

interface TranslationsValue {
  catalog: readonly TranslationEdition[]
  activeIds: readonly string[]
  activeEditions: readonly TranslationEdition[]
  primaryEdition: TranslationEdition | null
  toggleTranslation: (id: string) => void
  setActiveIds: (ids: readonly string[]) => void
}

const TranslationsContext = createContext<TranslationsValue | null>(null)

function isKnownId(id: unknown): id is string {
  return typeof id === 'string' && TRANSLATION_CATALOG.some((edition) => edition.id === id)
}

function readStoredIds(): readonly string[] {
  try {
    const raw = localStorage.getItem(TRANSLATIONS_KEY)
    if (!raw) return [...DEFAULT_TRANSLATION_IDS]
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [...DEFAULT_TRANSLATION_IDS]
    const ids = parsed.filter(isKnownId)
    return ids.length > 0 ? ids : [...DEFAULT_TRANSLATION_IDS]
  } catch {
    return [...DEFAULT_TRANSLATION_IDS]
  }
}

export function TranslationsProvider({ children }: { children: ReactNode }) {
  const [activeIds, setActiveIdsState] = useState<readonly string[]>(readStoredIds)

  useEffect(() => {
    try {
      localStorage.setItem(TRANSLATIONS_KEY, JSON.stringify(activeIds))
    } catch {
      // storage unavailable — selection still works for the session
    }
  }, [activeIds])

  const toggleTranslation = useCallback((id: string) => {
    setActiveIdsState((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev
        return prev.filter((existing) => existing !== id)
      }
      return [...prev, id]
    })
  }, [])

  const setActiveIds = useCallback((ids: readonly string[]) => {
    const next = Array.from(new Set(ids.filter(isKnownId)))
    if (next.length === 0) return
    setActiveIdsState(next)
  }, [])

  const value = useMemo<TranslationsValue>(() => {
    const activeEditions = TRANSLATION_CATALOG.filter((edition) => activeIds.includes(edition.id))
    return {
      catalog: TRANSLATION_CATALOG,
      activeIds,
      activeEditions,
      primaryEdition: activeEditions[0] ?? null,
      toggleTranslation,
      setActiveIds,
    }
  }, [activeIds, toggleTranslation, setActiveIds])

  return (
    <TranslationsContext.Provider value={value}>{children}</TranslationsContext.Provider>
  )
}

export function useTranslations(): TranslationsValue {
  const context = useContext(TranslationsContext)
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationsProvider')
  }
  return context
}