/**
 * NoorulQuran brand — the app mark, wordmark, and colour tokens.
 *
 * The mark is the "Rub el Hizb" octagram (۞) — the eight-pointed star that
 * marks every quarter of a Qur'an copy — drawn as two gold squares (upright
 * and 45° diamond) softened by a radiant noor glow, cradling a gold
 * crescent-orb and a single guiding-light mote below it. Minimal, jewelled,
 * unmistakably Qur'anic. Drawn to stay crisp even at favicon size.
 */

/** Balanced Rub el Hizb mark — the brand's octagram, glow and crescent.
 *  The octagram is a solid gold seal (visible on any background) with a
 *  dark-emerald centre disc carrying the crescent + mote. */
export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="NoorulQuran logo"
    >
      <defs>
        <radialGradient id="nqm-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c7a23a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#c7a23a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nqm-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eec98c" />
          <stop offset="1" stopColor="#c7a23a" />
        </linearGradient>
        <mask id="nqm-cres">
          <rect width="64" height="64" fill="#fff" />
          <circle cx="34.1" cy="31.5" r="5.5" fill="#000" />
        </mask>
      </defs>

      {/* Radiant noor glow */}
      <circle cx="32" cy="32" r="26" fill="url(#nqm-glow)" />

      {/* Rub el Hizb octagram — solid gold seal (upright square + 45° diamond) */}
      <g fill="url(#nqm-gold)" fillRule="evenodd">
        <path d="M13.5 13.5h37v37h-37Z" />
        <path d="M32 5.84 58.16 32 32 58.16 5.84 32Z" />
      </g>

      {/* Dark-emerald centre disc cradling the crescent + mote */}
      <circle cx="32" cy="32" r="13.5" fill="#06211b" />

      {/* Crescent-orb, opening right */}
      <circle cx="32" cy="30.8" r="7" fill="url(#nqm-gold)" mask="url(#nqm-cres)" />

      {/* Guiding-light mote */}
      <circle cx="32" cy="38.4" r="1.6" fill="url(#nqm-gold)" />
    </svg>
  )
}

/** Icon-only app glyph (crisper, for nav/bottom bars/favicon contexts). */
export function LogoIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <radialGradient id="nqi-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c7a23a" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#c7a23a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nqi-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eec98c" />
          <stop offset="1" stopColor="#c7a23a" />
        </linearGradient>
        <mask id="nqi-cres">
          <rect width="64" height="64" fill="#fff" />
          <circle cx="34.1" cy="31.5" r="5.5" fill="#000" />
        </mask>
      </defs>

      {/* Radiant noor glow */}
      <circle cx="32" cy="32" r="26" fill="url(#nqi-glow)" />

      {/* Rub el Hizb octagram — solid gold seal */}
      <g fill="url(#nqi-gold)" fillRule="evenodd">
        <path d="M13.5 13.5h37v37h-37Z" />
        <path d="M32 5.84 58.16 32 32 58.16 5.84 32Z" />
      </g>

      {/* Dark-emerald centre disc */}
      <circle cx="32" cy="32" r="13.5" fill="#06211b" />

      {/* Crescent-orb, opening right */}
      <circle cx="32" cy="30.8" r="7" fill="url(#nqi-gold)" mask="url(#nqi-cres)" />

      {/* Guiding-light mote */}
      <circle cx="32" cy="38.4" r="1.6" fill="url(#nqi-gold)" />
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
