const MEMORY_TTL_MS = 10 * 60 * 1000
const STORAGE_TTL_MS = 24 * 60 * 60 * 1000
const CACHE_PREFIX = 'nq:cache:v1:'

interface CacheEntry<T> {
  expiresAt: number
  value: T
}

const memoryCache = new Map<string, CacheEntry<unknown>>()

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'The Quran service is rate limiting requests. Please try again shortly.') {
    super(message, 429)
    this.name = 'RateLimitError'
  }
}

function readStorage<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (typeof entry.expiresAt !== 'number' || Date.now() > entry.expiresAt) return null
    return entry
  } catch {
    return null
  }
}

function writeStorage(key: string, entry: CacheEntry<unknown>): void {
  try {
    const capped: CacheEntry<unknown> = {
      expiresAt: Math.min(entry.expiresAt, Date.now() + STORAGE_TTL_MS),
      value: entry.value,
    }
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(capped))
  } catch {
    return
  }
}

export async function fetchJson<T>(
  url: string,
  options: { ttlMs?: number; signal?: AbortSignal; headers?: Record<string, string> } = {},
): Promise<T> {
  const { ttlMs = MEMORY_TTL_MS, signal, headers } = options

  const memoryHit = memoryCache.get(url)
  if (memoryHit && Date.now() < memoryHit.expiresAt) {
    return memoryHit.value as T
  }

  const storageHit = readStorage<T>(url)
  if (storageHit) {
    memoryCache.set(url, storageHit)
    return storageHit.value
  }

  let response: Response
  try {
    response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json', ...headers },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError('Network request failed. Check your connection and try again.', 0)
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '')
    if (response.status === 429) throw new RateLimitError()
    throw new ApiError(
      bodyText.slice(0, 200) || `Request failed with status ${response.status}.`,
      response.status,
    )
  }

  const value = (await response.json()) as T
  const entry: CacheEntry<T> = { expiresAt: Date.now() + ttlMs, value }
  memoryCache.set(url, entry)
  if (ttlMs >= MEMORY_TTL_MS) writeStorage(url, entry)
  return value
}

export function clearHttpCache(): void {
  memoryCache.clear()
  try {
    const stale: string[] = []
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (key?.startsWith(CACHE_PREFIX)) stale.push(key)
    }
    for (const key of stale) window.localStorage.removeItem(key)
  } catch {
    return
  }
}
