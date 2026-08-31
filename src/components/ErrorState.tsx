import { AlertTriangle, RefreshCw, CircleArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Consistent failure surface — a calm explanation plus an obvious way forward.
 * `onRetry` re-runs the failed fetch; optionally `backTo` offers navigation.
 */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  backTo,
  backLabel = 'Go back',
}: {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  backTo?: string
  backLabel?: string
}) {
  return (
    <div
      className="card flex flex-col items-center gap-4 rounded-2xl border-red-400/30 px-6 py-10 text-center"
      role="alert"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-300">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        {message && <p className="mt-1 text-xs leading-relaxed text-ink-muted">{message}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            {retryLabel}
          </button>
        )}
        {backTo && (
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-brand hover:text-brand"
          >
            <CircleArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {backLabel}
          </Link>
        )}
      </div>
    </div>
  )
}