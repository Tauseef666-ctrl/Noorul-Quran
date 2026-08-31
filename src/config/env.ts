interface AppEnv {
  readonly VITE_QURAN_PROVIDER?: string
  readonly VITE_QURAN_FOUNDATION_API_KEY?: string
  readonly VITE_SITE_URL?: string
}

const env = import.meta.env as unknown as AppEnv

/** Canonical production origin for SEO metadata (sitemap/robots mirror this). */
export const DEFAULT_SITE_URL = 'https://tauseef666-ctrl.github.io/Noorul-Quran'

export const appConfig = {
  activeProviderId: env.VITE_QURAN_PROVIDER || 'canonical',
  quranFoundationApiKey: env.VITE_QURAN_FOUNDATION_API_KEY || undefined,
  siteUrl: (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, ''),
} as const
