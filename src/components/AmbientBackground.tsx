/*
 * Meditative animated background — slow-rolling emerald + gold glow and a few
 * floating motes drifting upward. Render once, fixed behind all content.
 * transform/opacity only; entirely disabled under prefers-reduced-motion.
 */

const PARTICLES = [
  { left: '8%', size: 2, dur: 26, delay: 0, opacity: 0.35, gold: false },
  { left: '16%', size: 3, dur: 31, delay: 4, opacity: 0.28, gold: true },
  { left: '27%', size: 2, dur: 24, delay: 9, opacity: 0.3, gold: false },
  { left: '38%', size: 3, dur: 34, delay: 1, opacity: 0.22, gold: false },
  { left: '49%', size: 2, dur: 28, delay: 6, opacity: 0.32, gold: true },
  { left: '58%', size: 3, dur: 36, delay: 12, opacity: 0.2, gold: false },
  { left: '67%', size: 2, dur: 25, delay: 3, opacity: 0.3, gold: false },
  { left: '76%', size: 3, dur: 30, delay: 8, opacity: 0.26, gold: true },
  { left: '85%', size: 2, dur: 27, delay: 14, opacity: 0.32, gold: false },
  { left: '93%', size: 3, dur: 33, delay: 2, opacity: 0.24, gold: false },
]

export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden"
    >
      {/* Emerald wash */}
      <div
        className="ambient-blob"
        style={{
          top: '8%',
          left: '10%',
          width: '34rem',
          height: '34rem',
          background: 'radial-gradient(circle, rgba(62,207,154,0.16), transparent 65%)',
          ['--blob-dur' as string]: '42s',
        }}
      />
      {/* Gold wash */}
      <div
        className="ambient-blob"
        style={{
          top: '42%',
          right: '6%',
          width: '30rem',
          height: '30rem',
          background: 'radial-gradient(circle, rgba(212,175,55,0.12), transparent 65%)',
          ['--blob-dur' as string]: '52s',
          animationDelay: '-18s',
        }}
      />
      {/* Deep emerald lower wash */}
      <div
        className="ambient-blob"
        style={{
          bottom: '-8%',
          left: '34%',
          width: '40rem',
          height: '30rem',
          background: 'radial-gradient(circle, rgba(20,90,70,0.16), transparent 66%)',
          ['--blob-dur' as string]: '60s',
          animationDelay: '-30s',
        }}
      />
      {/* Floating motes */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="ambient-particle"
          style={{
            left: p.left,
            ['--p-size' as string]: `${p.size}px`,
            ['--p-dur' as string]: `${p.dur}s`,
            ['--p-delay' as string]: `${p.delay}s`,
            ['--p-op' as string]: p.opacity,
            ['--p-color' as string]: p.gold ? 'var(--gold)' : 'var(--brand)',
          }}
        />
      ))}
    </div>
  )
}