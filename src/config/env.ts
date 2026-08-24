interface AppEnv {
  readonly VITE_QURAN_PROVIDER?: string
  readonly VITE_QURAN_FOUNDATION_API_KEY?: string
}

const env = import.meta.env as unknown as AppEnv

export const appConfig = {
  activeProviderId: env.VITE_QURAN_PROVIDER || 'alqurancloud',
  quranFoundationApiKey: env.VITE_QURAN_FOUNDATION_API_KEY || undefined,
} as const
