import type { TranslationEdition } from '../types/quran'
import { langDir } from '../services/quran/translationProvider'

interface AyahTranslationsProps {
  textByEdition: Record<string, string>
  editions: readonly TranslationEdition[]
  hasData: boolean
}

/**
 * Renders the active translation editions for a single ayah with correct
 * lang/dir typography. Vetted published text is marked translate="no" so the
 * browser never auto-translates it. Shows a soft skeleton line while loading.
 */
export function AyahTranslations({ textByEdition, editions, hasData }: AyahTranslationsProps) {
  if (editions.length === 0) return null

  if (!hasData) {
    return <div className="h-4 w-48 animate-pulse rounded bg-line" aria-hidden />
  }

  return (
    <div className="space-y-2">
      {editions.map((edition) => {
        const text = textByEdition[edition.id]
        if (!text) return null
        const dir = langDir(edition.language)
        return (
          <p
            key={edition.id}
            lang={edition.language}
            dir={dir}
            translate="no"
            className={`translation-${edition.language} text-[15px] leading-relaxed text-ink-muted`}
          >
            {text}
          </p>
        )
      })}
    </div>
  )
}