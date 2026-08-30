import { motion } from 'framer-motion'
import { GeometricPattern } from './GeometricPattern'
import { LogoMark } from './LogoMark'

/**
 * Quran-inspired loading surface — geometric mark + wordmark + calm status line.
 * Used on route-level data waits; short-lived by design (never a long splash).
 */
export function LoadingScreen({ label = 'Loading Quran…' }: { label?: string }) {
  return (
    <div className="relative flex min-h-[55vh] flex-col items-center justify-center overflow-hidden rounded-3xl">
      <GeometricPattern
        variant="gold"
        className="absolute inset-0 h-full w-full object-cover"
        opacity={0.5}
      />
      <div className="relative flex flex-col items-center gap-5 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-lg"
        >
          <LogoMark className="h-7 w-7" />
        </motion.div>
        <div>
          <p
            className="arabic-heading text-3xl leading-none text-ink"
            lang="ar"
            dir="rtl"
            translate="no"
          >
            نور القرآن
          </p>
          <p className="mt-2 text-xs font-medium tracking-wide text-ink-muted">
            {label}
          </p>
        </div>
        <div className="h-1 w-28 overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand to-gold"
            animate={{ x: ['-100%', '220%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  )
}