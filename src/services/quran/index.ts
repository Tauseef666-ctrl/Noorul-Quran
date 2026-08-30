import { appConfig } from '../../config/env'
import { canonicalProvider } from './canonicalProvider'
import type { QuranProvider } from './quranProvider'

/**
 * Only the bundled canonical provider is eagerly imported. The remote
 * providers (and their network stack, http cache, translations/tafsir/search
 * engines) are code-split behind dynamic import() so the initial bundle stays
 * light and pulls tooling on a first-use basis.
 */
type RemoteProviderId = 'alqurancloud' | 'quranfoundation'

let remotePromise: Promise<Record<RemoteProviderId, QuranProvider>> | null = null

function loadRemotes(): Promise<Record<RemoteProviderId, QuranProvider>> {
  remotePromise ??= Promise.all([
    import('./alQuranCloudProvider'),
    import('./quranFoundationProvider'),
  ]).then(([alqurancloud, quranfoundation]) => ({
    alqurancloud: alqurancloud.alQuranCloudProvider,
    quranfoundation: quranfoundation.quranFoundationProvider,
  }))
  return remotePromise
}

async function resolveProvider(id: string): Promise<QuranProvider | undefined> {
  if (id === 'canonical') return canonicalProvider
  const remotes = await loadRemotes()
  return remotes[id as RemoteProviderId]
}

export async function listProviders(): Promise<QuranProvider[]> {
  const remotes = await loadRemotes()
  return [canonicalProvider, remotes.alqurancloud, remotes.quranfoundation]
}

export async function getProvider(id: string): Promise<QuranProvider | undefined> {
  return resolveProvider(id)
}

let activeProviderPromise: Promise<QuranProvider> | null = null

export function getActiveProvider(): Promise<QuranProvider> {
  activeProviderPromise ??= resolveProvider(appConfig.activeProviderId).then(
    (provider) => provider ?? canonicalProvider,
  )
  return activeProviderPromise
}