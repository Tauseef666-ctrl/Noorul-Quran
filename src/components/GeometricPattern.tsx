/*
 * Subtle Islamic geometric pattern — an eight-pointed star / girih tile, drawn
 * once as an inline SVG tile and repeated at very low opacity. Used on hero,
 * section separators, empty states, footer and loading surfaces. Never placed
 * behind Quran text.
 */

type Variant = 'gold' | 'emerald' | 'ink'

interface GeometricPatternProps {
  variant?: Variant
  className?: string
  size?: number
  opacity?: number
}

function strokeFor(variant: Variant): string {
  switch (variant) {
    case 'gold':
      return 'var(--gold)'
    case 'emerald':
      return 'var(--brand)'
    case 'ink':
      return 'var(--line-strong)'
  }
}

export function GeometricPattern({
  variant = 'gold',
  className = '',
  size = 88,
  opacity = 0.6,
}: GeometricPatternProps) {
  const stroke = strokeFor(variant)
  const half = size / 2
  const star = (h: number) =>
    `${h},6 ${h + 3},${h - 7} ${h + 14},${h - 15} ${h + 3},${h - 21} ${h + 8},${h - 34} ${h},${h - 23} ${h - 8},${h - 34} ${h - 3},${h - 21} ${h - 14},${h - 15} ${h - 3},${h - 7}`

  return (
    <svg
      aria-hidden
      className={`pointer-events-none select-none ${className}`}
      width={size}
      height={size}
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={`geo-${variant}`}
          patternUnits="userSpaceOnUse"
          width={size}
          height={size}
          patternTransform={`translate(${half} ${half})`}
        />
        <clipPath id={`geo-clip-${variant}`}>
          <rect width={size} height={size} />
        </clipPath>
      </defs>
      <g clipPath={`url(#geo-clip-${variant})`}>
        <g stroke={stroke} strokeWidth="1" fill="none" opacity="0.7">
          {/* 8-point star */}
          <polygon points={star(half)} />
          {/* Interlocking cross-lines */}
          <line x1={0} y1={half} x2={size} y2={half} />
          <line x1={half} y1={0} x2={half} y2={size} />
          <line x1={4} y1={4} x2={size - 4} y2={size - 4} />
          <line x1={size - 4} y1={4} x2={4} y2={size - 4} />
          {/* Corner framing squares */}
          <rect x="6" y="6" width={half - 14} height={half - 14} />
          <rect x={size - half + 8} y={size - half + 8} width={half - 14} height={half - 14} />
        </g>
      </g>
    </svg>
  )
}