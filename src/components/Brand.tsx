/**
 * NoorulQuran brand — the app mark, wordmark, and colour tokens.
 *
 * The mark is a "Guiding Light": a slender emerald crescent-orb that casts a
 * single mote of light down onto an open Qur'an page below, sitting inside a
 * six-point medallion. Islamic geometry + a book + the Noor (light) idea, drawn
 * to stay crisp at favicon size. Built with balanced, soothing curves — no neon.
 */

/** Balanced geometric medallion mark — optimized for small sizes. */
export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="NoorulQuran logo"
    >
      <defs>
        <linearGradient id="nq-emerald" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f6b52" />
          <stop offset="1" stopColor="#06211b" />
        </linearGradient>
        <linearGradient id="nq-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eec98c" />
          <stop offset="1" stopColor="#c7a23a" />
        </linearGradient>
      </defs>

      {/* Medallion outer ring (hexagonal) */}
      <path
        d="M32 4 56 18v28L32 60 8 46V18Z"
        fill="url(#nq-emerald)"
        stroke="url(#nq-gold)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Inner ring */}
      <path
        d="M32 11 50.6 22v20L32 53 13.4 42V22Z"
        fill="none"
        stroke="url(#nq-gold)"
        strokeWidth="0.9"
        strokeOpacity="0.65"
        strokeLinejoin="round"
      />

      {/* Crescent-orb: thin gold crescent above */}
      <path
        d="M37.5 16.5a8.5 8.5 0 1 0 0 17 7.2 7.2 0 1 1 0-17Z"
        transform="rotate(24 37 25)"
        fill="url(#nq-gold)"
      />
      {/* Guiding light mote */}
      <circle cx="37" cy="38.4" r="1.7" fill="url(#nq-gold)" />

      {/* Open Qur'an page below (two facing leaves) */}
      <g stroke="url(#nq-gold)" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <path d="M26 34c-3 1.6-6.6 2.3-10 2 2.6 4.6 6.2 7 10 7.4 3.8-.4 7.4-2.8 10-7.4-3.4.3-7-.4-10-2Z" />
        <path d="M38 34c3 1.6 6.6 2.3 10 2-2.6 4.6-6.2 7-10 7.4-3.8-.4-7.4-2.8-10-7.4 3.4.3 7-.4 10-2Z" />
      </g>
    </svg>
  )
}

/** Icon-only app glyph (crisper, for nav/bottom bars/favicon contexts). */
export function LogoIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="nq-gold-i" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eec98c" />
          <stop offset="1" stopColor="#c7a23a" />
        </linearGradient>
      </defs>
      <path
        d="M37 15a9 9 0 1 0 0 18 7.4 7.4 0 1 1 0-18Z"
        transform="rotate(24 37 24)"
        fill="url(#nq-gold-i)"
      />
      <circle cx="37" cy="37.4" r="1.7" fill="url(#nq-gold-i)" />
      <g stroke="url(#nq-gold-i)" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M26 33c-3 1.6-6.6 2.3-10 2 2.6 4.6 6.2 7 10 7.4 3.8-.4 7.4-2.8 10-7.4-3.4.3-7-.4-10-2Z" />
        <path d="M38 33c3 1.6 6.6 2.3 10 2-2.6 4.6-6.2 7-10 7.4-3.8-.4-7.4-2.8-10-7.4 3.4.3 7-.4 10-2Z" />
      </g>
    </svg>
  )
}

/** Full lockup: icon + "NoorulQuran" wordmark with Arabic pairing. */
export function LogoLockup({
  className = '',
  size = 'md',
  iconOnly = false,
  showArabic = true,
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  iconOnly?: boolean
  showArabic?: boolean
}) {
  const iconCls =
    size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
  const titleCls =
    size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl'
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={iconCls} />
      {iconOnly ? null : (
        <span className="flex flex-col justify-center leading-none">
          <span className={`${titleCls} font-extrabold tracking-tight text-ink`}>
            Noorul<span className="text-gold">Quran</span>
          </span>
          {showArabic && (
            <span
              className="arabic-heading mt-0.5 text-xs text-ink-muted"
              lang="ar"
              dir="rtl"
              translate="no"
            >
              نور القرآن
            </span>
          )}
        </span>
      )}
    </span>
  )
}
