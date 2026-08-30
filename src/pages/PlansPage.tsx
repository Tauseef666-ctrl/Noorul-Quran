import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarCheck, Target, ArrowRight, Check } from 'lucide-react'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
}

interface PlanDay {
  day: number
  juz: number
  label: string
}

type PlanKey = '30' | '60'

const STORAGE_KEY = 'nq:plans'

interface StoredPlans {
  selected: PlanKey | null
  completed: Record<PlanKey, number[]>
  customGoal: string
}

function loadPlans(): StoredPlans {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyPlans()
    const parsed = JSON.parse(raw) as Partial<StoredPlans>
    return {
      selected: parsed.selected === '30' || parsed.selected === '60' ? parsed.selected : null,
      completed: {
        '30': Array.isArray(parsed.completed?.['30']) ? parsed.completed['30'] : [],
        '60': Array.isArray(parsed.completed?.['60']) ? parsed.completed['60'] : [],
      },
      customGoal: typeof parsed.customGoal === 'string' ? parsed.customGoal : '',
    }
  } catch {
    return emptyPlans()
  }
}

function emptyPlans(): StoredPlans {
  return { selected: null, completed: { '30': [], '60': [] }, customGoal: '' }
}

function generate30DayPlan(): PlanDay[] {
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    juz: i + 1,
    label: `Juz ${i + 1}`,
  }))
}

function generate60DayPlan(): PlanDay[] {
  const days: PlanDay[] = []
  for (let juz = 1; juz <= 30; juz++) {
    days.push({ day: days.length + 1, juz, label: `Juz ${juz} — Part 1` })
    days.push({ day: days.length + 1, juz, label: `Juz ${juz} — Part 2` })
  }
  return days
}

export default function PlansPage() {
  const [plans, setPlans] = useState<StoredPlans>(loadPlans)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
    } catch {
      return
    }
  }, [plans])

  const plan30 = generate30DayPlan()
  const plan60 = generate60DayPlan()
  const activeKey = plans.selected
  const activePlan = activeKey === '30' ? plan30 : activeKey === '60' ? plan60 : null
  const completed = activeKey ? plans.completed[activeKey] : []

  const selectPlan = (key: PlanKey) => {
    setPlans((prev) => ({ ...prev, selected: prev.selected === key ? null : key }))
  }

  const toggleDay = (day: number) => {
    if (!activeKey) return
    setPlans((prev) => {
      const list = prev.completed[activeKey]
      const next = list.includes(day) ? list.filter((d) => d !== day) : [...list, day]
      return { ...prev, completed: { ...prev.completed, [activeKey]: next } }
    })
  }

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
          onClick={() => selectPlan('30')}
          className={`card rounded-2xl p-5 text-left transition-all ${
            plans.selected === '30' ? 'ring-2 ring-brand' : 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]'
          }`}
        >
          <CalendarCheck className="h-6 w-6 text-brand" aria-hidden />
          <h2 className="mt-2 text-sm font-semibold text-ink">30-Day Plan</h2>
          <p className="mt-1 text-xs text-ink-muted">One Juz per day</p>
          <p className="mt-2 text-[11px] text-ink-faint">
            {plans.completed['30'].length} of 30 days read
          </p>
        </motion.button>

        <motion.button
          variants={fadeIn}
          type="button"
          onClick={() => selectPlan('60')}
          className={`card rounded-2xl p-5 text-left transition-all ${
            plans.selected === '60' ? 'ring-2 ring-brand' : 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]'
          }`}
        >
          <Target className="h-6 w-6 text-gold" aria-hidden />
          <h2 className="mt-2 text-sm font-semibold text-ink">60-Day Plan</h2>
          <p className="mt-1 text-xs text-ink-muted">Gentle pace, two days per Juz</p>
          <p className="mt-2 text-[11px] text-ink-faint">
            {plans.completed['60'].length} of 60 days read
          </p>
        </motion.button>
      </motion.div>

      {/* Custom Goal */}
      <motion.div variants={fadeIn} className="card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-ink">Custom Goal</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Set a personal reading goal — how many pages or ayahs you would like to read each day
        </p>
        <input
          type="text"
          value={plans.customGoal}
          onChange={(e) => setPlans((prev) => ({ ...prev, customGoal: e.target.value }))}
          placeholder="e.g., 5 pages per day"
          className="mt-3 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          aria-label="Custom reading goal"
        />
        {plans.customGoal.trim() && (
          <p className="mt-2 text-[11px] text-ink-muted italic">
            Your goal:{' '}
            <span className="font-semibold text-ink not-italic">{plans.customGoal.trim()}</span>
          </p>
        )}
        <p className="mt-2 text-[11px] text-ink-faint italic">
          Progress is kept privately on this device.
        </p>
      </motion.div>

      {/* Plan Display */}
      {activePlan && activeKey && (
        <motion.div variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                {activeKey === '30' ? '30-Day' : '60-Day'} Plan
              </h2>
              <p className="mt-1 text-xs text-ink-muted">
                {completed.length} of {activePlan.length} days read
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-brand">
                {Math.round((completed.length / activePlan.length) * 100)}%
              </p>
              <p className="text-[10px] text-ink-faint">complete</p>
            </div>
          </div>

          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuenow={Math.round((completed.length / activePlan.length) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Plan reading progress"
          >
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${(completed.length / activePlan.length) * 100}%` }}
            />
          </div>

          <p className="mt-3 text-[11px] text-ink-faint italic">
            Mark a day as read once you have finished it. No streaks, no pressure — take your own
            pace.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {activePlan.map((day) => {
              const isDone = completed.includes(day.day)
              return (
                <div
                  key={day.day}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 transition-colors ${
                    isDone ? 'border-brand/30 bg-brand/5' : 'border-line'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleDay(day.day)}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isDone
                        ? 'border-brand bg-brand text-white'
                        : 'border-line text-transparent hover:border-brand hover:text-brand'
                    }`}
                    aria-label={isDone ? `Mark day ${day.day} as not read` : `Mark day ${day.day} as read`}
                    aria-pressed={isDone}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-xs font-medium ${
                        isDone ? 'text-ink-muted line-through' : 'text-ink'
                      }`}
                    >
                      Day {day.day} · {day.label}
                    </span>
                  </span>
                  <Link
                    to={`/juz/${day.juz}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand/10 hover:text-brand"
                    aria-label={`Read ${day.label}`}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}