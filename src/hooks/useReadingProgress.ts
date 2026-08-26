import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'nq:reading-progress'

export interface ReadingProgress {
  surahNumber: number
  ayahNumber: number
  page: number
  juz: number
  timestamp: number
}

function load(): ReadingProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as ReadingProgress
    if (!data.surahNumber || !data.ayahNumber) return null
    return data
  } catch {
    return null
  }
}

function save(progress: ReadingProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    return
  }
}

export function useReadingProgress() {
  const [progress, setProgress] = useState<ReadingProgress | null>(load)

  const updateProgress = useCallback((update: Omit<ReadingProgress, 'timestamp'>) => {
    setProgress({ ...update, timestamp: Date.now() })
  }, [])

  useEffect(() => {
    if (progress) save(progress)
  }, [progress])

  return { progress, updateProgress }
}
