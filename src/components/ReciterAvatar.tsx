import { motion } from 'framer-motion'

/**
 * A refined, neutral avatar for reciters — a medallion monogram built from the
 * first initials of the reciter's name. Deliberately avoids any photograph,
 * invented face, or likeness; the verified reciter names stay the source of truth.
 * Emerald-tinted when selected, muted otherwise.
 */
export function ReciterAvatar({
  name,
  size = 'md',
  selected = false,
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  const dims = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' }[size]
  const text = { sm: 'text-[11px]', md: 'text-[13px]', lg: 'text-lg' }[size]

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center rounded-full ${dims} ${
        selected
          ? 'bg-gradient-to-br from-brand to-brand-deep text-white shadow-[var(--shadow-glow)] ring-2 ring-gold/40'
          : 'bg-gradient-to-br from-brand/15 to-brand/5 text-brand ring-1 ring-brand/20'
      }`}
    >
      <span className={`num-ltr font-semibold tracking-wide ${text}`}>{initials}</span>
    </motion.div>
  )
}
