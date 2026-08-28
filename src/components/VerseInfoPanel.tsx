import { motion } from 'framer-motion'
import { X, MapPin } from 'lucide-react'
import type { Ayah } from '../types/quran'

interface VerseInfoPanelProps {
  ayah: Ayah
  isOpen: boolean
  onClose: () => void
}

export function VerseInfoPanel({ ayah, isOpen, onClose }: VerseInfoPanelProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="mt-2 rounded-xl border border-line bg-brand/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-brand" aria-hidden />
            <p className="text-xs font-semibold text-ink">Verse Info</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-ink-faint hover:text-ink"
            aria-label="Close verse info"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <InfoRow label="Page" value={String(ayah.navigation.page)} />
          <InfoRow label="Juz" value={String(ayah.navigation.juz)} />
          <InfoRow label="Hizb" value={String(ayah.navigation.hizb)} />
          <InfoRow label="Rub al-Hizb" value={String(ayah.navigation.rubElHizb)} />
          <InfoRow label="Ruku" value={String(ayah.navigation.ruku)} />
          <InfoRow label="Manzil" value={String(ayah.navigation.manzil)} />
          {ayah.sajdah && (
            <InfoRow
              label="Sajdah"
              value={ayah.sajdah.kind === 'obligatory' ? 'Obligatory' : 'Recommended'}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-ink-faint">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  )
}
