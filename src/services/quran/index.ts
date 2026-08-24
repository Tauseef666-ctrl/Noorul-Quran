import { appConfig } from '../../config/env'
import { alQuranCloudProvider } from './alQuranCloudProvider'
import { quranFoundationProvider } from './quranFoundationProvider'
import type { QuranProvider } from './quranProvider'

const REGISTRY: Record<string, QuranProvider> = {
  alqurancloud: alQuranCloudProvider,
  quranfoundation: quranFoundationProvider,
}

export function listProviders(): QuranProvider[] {
  return Object.values(REGISTRY)
}

export function getProvider(id: string): QuranProvider | undefined {
  return REGISTRY[id]
}

export function getActiveProvider(): QuranProvider {
  const provider = REGISTRY[appConfig.activeProviderId]
  return provider ?? alQuranCloudProvider
}
