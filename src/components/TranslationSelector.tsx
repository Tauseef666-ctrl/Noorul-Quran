import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useTranslations } from '../store/translations'
import { fadeUp, staggerContainer } from '../animations'
import type { TranslationEdition } from '../types/quran'

function groupByLanguage(catalog: readonly TranslationEdition[]) {
  const groups: { languageName: string; editions: TranslationEdition[] }[] = []
  for (const edition of catalog) {
    const group = groups.find((g) => g.languageName === edition.languageName)
    if (group) group.editions.push(edition)
    else groups.push({ languageName: edition.languageName, editions: [edition] })
  }
  return groups
}

export function TranslationSelector() {
  const { catalog, activeIds, toggleTranslation } = useTranslations()
  const groups = groupByLanguage(catalog)

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {groups.map((group) => (
        <div key={group.languageName}>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
            {group.languageName}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {group.editions.map((edition) => {
              const active = activeIds.includes(edition.id)
              return (
                <motion.button
                  key={edition.id}
                  variants={fadeUp}
                  type="button"
                  onClick={() => toggleTranslation(edition.id)}
                  aria-pressed={active}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                    active
                      ? 'border-brand bg-brand/5 shadow-[var(--shadow-glow)]'
                      : 'border-line hover:border-brand/40 hover:bg-brand/5'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      active ? 'border-brand bg-brand text-white' : 'border-line text-transparent'
                    }`}
                    aria-hidden
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-ink">
                      {edition.name}
                    </span>
                    <span className="block truncate text-[11px] text-ink-faint">
                      {edition.translator}
                    </span>
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      ))}
    </motion.div>
  )
}