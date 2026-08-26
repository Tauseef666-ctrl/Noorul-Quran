import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarCheck, Target, ArrowRight } from 'lucide-react'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
}

interface PlanDay {
  juz: number
  label: string
}

function generate30DayPlan(): PlanDay[] {
  return Array.from({ length: 30 }, (_, i) => ({
    juz: i + 1,
    label: `Juz ${i + 1}`,
  }))
}

function generate60DayPlan(): PlanDay[] {
  const days: PlanDay[] = []
  for (let juz = 1; juz <= 30; juz++) {
    days.push({ juz, label: `Juz ${juz} (Day ${days.length + 1})` })
    days.push({ juz, label: `Juz ${juz} (Day ${days.length + 1})` })
  }
  return days
}

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<'30' | '60' | null>(null)
  const [customGoal, setCustomGoal] = useState('')

  const plan30 = generate30DayPlan()
  const plan60 = generate60DayPlan()
  const activePlan = selectedPlan === '30' ? plan30 : selectedPlan === '60' ? plan60 : null

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.header variants={fadeIn}>
        <h1 className="text-2xl font-bold text-ink">Reading Plans</h1>
        <p className="text-sm text-ink-muted">Calm, personal Quran reading goals</p>
      </motion.header>

      {/* Plan Selection */}
      <motion.div variants={stagger} className="grid gap-3 sm:grid-cols-2">
        <motion.button
          variants={fadeIn}
          type="button"
          onClick={() => setSelectedPlan(selectedPlan === '30' ? null : '30')}
          className={`card rounded-2xl p-5 text-left transition-all ${
            selectedPlan === '30' ? 'ring-2 ring-brand' : 'hover:shadow-lg'
          }`}
        >
          <CalendarCheck className="h-6 w-6 text-brand" aria-hidden />
          <h2 className="mt-2 text-sm font-semibold text-ink">30-Day Plan</h2>
          <p className="mt-1 text-xs text-ink-muted">One Juz per day</p>
          <p className="mt-2 text-[11px] text-ink-faint">Complete the Quran in 30 days</p>
        </motion.button>

        <motion.button
          variants={fadeIn}
          type="button"
          onClick={() => setSelectedPlan(selectedPlan === '60' ? null : '60')}
          className={`card rounded-2xl p-5 text-left transition-all ${
            selectedPlan === '60' ? 'ring-2 ring-brand' : 'hover:shadow-lg'
          }`}
        >
          <Target className="h-6 w-6 text-gold" aria-hidden />
          <h2 className="mt-2 text-sm font-semibold text-ink">60-Day Plan</h2>
          <p className="mt-1 text-xs text-ink-muted">Gentle pace, two days per Juz</p>
          <p className="mt-2 text-[11px] text-ink-faint">Complete the Quran in 60 days</p>
        </motion.button>
      </motion.div>

      {/* Custom Goal */}
      <motion.div variants={fadeIn} className="card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-ink">Custom Goal</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Set a personal reading goal — how many pages or ayahs per day
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            placeholder="e.g., 5 pages per day"
            className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <p className="mt-2 text-[11px] text-ink-faint italic">
          Tracking will be available when reading plans are fully implemented
        </p>
      </motion.div>

      {/* Plan Display */}
      {activePlan && (
        <motion.div variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-ink">
            {selectedPlan === '30' ? '30-Day' : '60-Day'} Plan
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            {activePlan.length} days · Tap a day to start reading
          </p>
          <div className="mt-4 space-y-1.5">
            {activePlan.map((day, index) => (
              <Link
                key={index}
                to={`/juz/${day.juz}`}
                className="group flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-brand/5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium text-ink">{day.label}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
