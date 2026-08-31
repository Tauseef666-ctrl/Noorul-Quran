import { appConfig } from '../config/env'

export interface PageMetaInput {
  title: string
  description: string
  path?: string
}

/** Absolutize a site-relative path against the configured canonical origin. */
export function siteUrl(path: string): string {
  const base = appConfig.siteUrl
  const clean = path.replace(/^\/+/, '')
  return clean ? `${base}/${clean}` : base
}

function upsertMeta(key: 'name' | 'property', value: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${value}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(key, value)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

const OG_IMAGE = siteUrl('icons/pwa-512.png')

/**
 * Applies per-route SEO metadata (title, description, canonical, OpenGraph,
 * Twitter) to the document head. Call wherever a page's metadata becomes
 * known — the last call on a pathname wins (child effects run after layout).
 */
export function applyPageMeta(meta: PageMetaInput): void {
  const path = meta.path ?? window.location.pathname

  document.title = meta.title
  upsertMeta('name', 'description', meta.description)

  upsertMeta('name', 'robots', 'index, follow')

  const absolute = siteUrl(path)
  setCanonical(absolute)

  upsertMeta('property', 'og:site_name', 'NoorulQuran')
  upsertMeta('property', 'og:title', meta.title)
  upsertMeta('property', 'og:description', meta.description)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:url', absolute)
  upsertMeta('property', 'og:image', OG_IMAGE)
  upsertMeta('property', 'og:locale', 'en_US')
  upsertMeta('property', 'og:locale:alternate', 'ar_SA')

  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', meta.title)
  upsertMeta('name', 'twitter:description', meta.description)
  upsertMeta('name', 'twitter:image', OG_IMAGE)
}