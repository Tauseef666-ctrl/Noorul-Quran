import { motion } from 'framer-motion'

/**
 * Cinematic, in-app-generated hero visual — an open Qur'an beneath a softly
 * glowing reading lamp, with a gentle crescent and light-motes drifting up.
 * Drawn entirely in SVG (no external imagery, no stock photos), license-safe,
 * and matches the deep-black → emerald → muted-gold identity. Sits on the right
 * (desktop) / stacked below the text (mobile), behind its own dark gradient
 * overlay so hero text stays readable.
 */
export function HeroVisual({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] ${className}`} aria-hidden>
      {/* Base cinematic gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 70% 0%, rgba(15,107,82,0.5), transparent 60%), linear-gradient(180deg,#07100d,#0a1512 55%,#050807)',
        }}
      />

      {/* Soft radial lamp glow */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(238,201,140,0.28), transparent 70%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg
        viewBox="0 0 640 520"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="hv-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#eec98c" />
            <stop offset="1" stopColor="#c7a23a" />
          </linearGradient>
          <linearGradient id="hv-ivory" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6efe0" />
            <stop offset="1" stopColor="#d9c9a3" />
          </linearGradient>
          <linearGradient id="hv-emerald" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d7f63" />
            <stop offset="1" stopColor="#0b3a2d" />
          </linearGradient>
          <filter id="hv-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Crescent moon */}
        <path
          d="M470 120a34 34 0 1 0 0 68 29 29 0 1 1 0-68Z"
          fill="url(#hv-gold)"
          opacity="0.9"
        />

        {/* Drifting light-motes */}
        <g fill="url(#hv-gold)">
          <circle cx="120" cy="200" r="3" opacity="0.7" />
          <circle cx="520" cy="300" r="2.2" opacity="0.5" />
          <circle cx="90" cy="330" r="2.5" opacity="0.6" />
          <circle cx="560" cy="180" r="2" opacity="0.4" />
        </g>

        {/* Reading lamp — stem + shade */}
        <g>
          <path
            d="M320 150 V240"
            stroke="url(#hv-gold)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M286 168 Q320 132 354 168"
            fill="none"
            stroke="url(#hv-gold)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* lamp flame glow */}
          <ellipse cx="320" cy="228" rx="40" ry="20" fill="url(#hv-gold)" opacity="0.18" filter="url(#hv-soft)" />
        </g>

        {/* Open Qur'an page — two facing leaves on an ivoried stand */}
        <g>
          <path
            d="M320 430 C 215 400 150 418 118 452 C 150 480 230 496 320 470 Z"
            fill="url(#hv-ivory)"
          />
          <path
            d="M320 430 C 425 400 490 418 522 452 C 490 480 410 496 320 470 Z"
            fill="url(#hv-ivory)"
          />
          {/* spine */}
          <path d="M320 430 L320 470" stroke="#a08a55" strokeWidth="4" />
          {/* leaf text-lines (abstract, never actual scripture) */}
          <g stroke="#7c6a44" strokeWidth="3" strokeLinecap="round" opacity="0.55">
            <path d="M196 446 q40 -8 80 2" />
            <path d="M196 460 q40 -8 80 2" />
            <path d="M364 446 q40 -8 80 2" />
            <path d="M364 460 q40 -8 80 2" />
          </g>
        </g>

        {/* Emerald underglow beneath the book */}
        <ellipse cx="320" cy="500" rx="220" ry="26" fill="url(#hv-emerald)" opacity="0.55" filter="url(#hv-soft)" />
      </svg>

      {/* Dark overlay to keep hero text readable above/around it */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,8,7,0.15), rgba(5,8,7,0.55))',
        }}
      />
    </div>
  )
}
