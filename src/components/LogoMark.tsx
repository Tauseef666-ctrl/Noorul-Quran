/** Shared book glyph path reused by the logo, loading screen and wordmark. */

export const bookIconPath =
  'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 4.5v15zm0 0V19a2.5 2.5 0 0 0 2.5 2.5H20v-2H6.5A2.5 2.5 0 0 1 4 19.5z'

export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={bookIconPath} />
    </svg>
  )
}