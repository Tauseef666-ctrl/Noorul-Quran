import { useSyncExternalStore } from 'react'

/**
 * Reactively subscribe to a CSS media query (e.g. mobile breakpoints). Returns
 * true when the query matches. SSR-safe (defaults to false on the server).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onStoreChange)
      return () => mql.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
