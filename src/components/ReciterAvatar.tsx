import { motion } from 'framer-motion'

/**
 * A refined, neutral avatar for reciters — a medallion monogram set inside a
 * thin decorative ring (a subtle nod to Islamic geometry / calligraphic
 * framing). Deliberately avoids any photograph, invented face, or likeness; the
 * verified reciter names stay the source of truth.
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

  const dims = { sm: 'h-8 w-8', md: 'h-12 w-12', lg: 'h-16 w-16' }[size]
  const text = { sm: 'text-[11px]', md: 'text-sm', lg: 'text-lg' }[size]

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-hidden
      className={`relative flex shrink-0 items-center justify-center rounded-full ${dims} ${
        selected
          ? 'bg-gradient-to-br from-brand to-brand-deep text-white shadow-[var(--shadow-glow)]'
          : 'bg-gradient-to-br from-brand/15 to-brand/5 text-brand'
      }`}
    >
      {/* ornamental ring — reads as an elegant calligraphic frame */}
      <span
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: selected ? 'rgba(238,201,140,0.6)' : 'rgba(160,125,36,0.35)' }}
      />
      <span className={`num-ltr font-semibold tracking-wide ${text}`}>{initials}</span>
    </motion.div>
  )
}
