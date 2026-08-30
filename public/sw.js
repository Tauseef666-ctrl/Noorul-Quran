/* NoorulQuran service worker — offline app shell without licensing hazards.
 *
 * LICENSE-SAFE CACHING RULES:
 *  - We only ever handle SAME-ORIGIN GET requests. Every external source
 *    (Al Quran Cloud translations/tafsir, islamic.network audio CDN, and any
 *    cross-origin API) is never intercepted here — those responses may be
 *    copyrighted (translations, tafsir, recitations) and must NOT be cached.
 *  - Requests carrying a `Range` header (streaming) pass through untouched.
 *  - The app shell (index.html + hashed build assets + bundled fonts) is cached
 *    for offline reading; hashed assets are immutable so stale-while-revalidate
 *    is safe.
 */
const VERSION = 'nq-shell-v1'
const SHELL_CACHE = 'nq-shell'
const STATIC_CACHE = 'nq-static'

const APP_SHELL_PATHS = [
  '/',
  '/manifest.webmanifest',
  '/icons/favicon-32.png',
  '/icons/pwa-192.png',
  '/icons/pwa-512.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
]

function isSameOrigin(url) {
  return url.origin === self.location.origin
}

function isImmutableAsset(url) {
  // Vite emits content-hashed filenames (e.g. assets/index-abc123.js) — safe to
  // cache-first. Non-hashed public files fall back to network-first.
  const path = url.pathname
  return (
    path.startsWith('/assets/') ||
    path.startsWith('/fonts/') ||
    path.startsWith('/icons/') ||
    path === '/manifest.webmanifest'
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE)
      await cache.addAll(APP_SHELL_PATHS)
    })(),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => key.startsWith('nq-') && key !== SHELL_CACHE && key !== STATIC_CACHE).map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (!isSameOrigin(url)) return
  if (request.headers.has('Range')) return

  // Navigations: network-first, offline app-shell fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request)
          if (response.ok) {
            const cache = await caches.open(SHELL_CACHE)
            cache.put('/', response.clone())
          }
          return response
        } catch {
          const cached = await caches.match('/')
          if (cached) return cached
          return new Response(
            '<h1>Offline</h1><p>NoorulQuran needs a connection to load this page.</p>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
          )
        }
      })(),
    )
    return
  }

  // Same-origin static assets: cache-first (immutable hashed files),
  // revalidate in the background for non-hashed files.
  if (isImmutableAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE)
        const cached = await cache.match(request)
        if (cached) {
          fetch(request)
            .then((res) => {
              if (res.ok) cache.put(request, res)
            })
            .catch(() => {})
          return cached
        }
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      })(),
    )
    return
  }

  // Everything else same-origin: network-first, stale fallback.
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request)
        return response
      } catch {
        const cached = await caches.match(request)
        return cached || Response.error()
      }
    })(),
  )
})