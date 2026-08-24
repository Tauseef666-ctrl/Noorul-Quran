export const AYAH_COUNTS: readonly number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
  26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6,
]

export const TOTAL_SURAHS = AYAH_COUNTS.length

export const TOTAL_AYAHS = AYAH_COUNTS.reduce((sum, count) => sum + count, 0)

const FIRST_GLOBAL_AYAH: readonly number[] = AYAH_COUNTS.reduce<number[]>(
  (offsets, count) => [...offsets, offsets[offsets.length - 1] + count],
  [0],
)

export function isValidSurah(surahNumber: number): boolean {
  return Number.isInteger(surahNumber) && surahNumber >= 1 && surahNumber <= TOTAL_SURAHS
}

export function isValidAyah(surahNumber: number, ayahNumber: number): boolean {
  if (!isValidSurah(surahNumber) || !Number.isInteger(ayahNumber)) return false
  return ayahNumber >= 1 && ayahNumber <= (AYAH_COUNTS[surahNumber - 1] ?? 0)
}

export function globalAyahNumber(surahNumber: number, ayahNumber: number): number {
  if (!isValidAyah(surahNumber, ayahNumber)) {
    throw new RangeError(`Invalid ayah reference ${surahNumber}:${ayahNumber}`)
  }
  return FIRST_GLOBAL_AYAH[surahNumber - 1] + ayahNumber
}

export function surahOfGlobal(globalAyah: number): number {
  if (!Number.isInteger(globalAyah) || globalAyah < 1 || globalAyah > TOTAL_AYAHS) {
    throw new RangeError(`Global ayah number out of range: ${globalAyah}`)
  }
  let low = 1
  let high = TOTAL_SURAHS
  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2)
    if (FIRST_GLOBAL_AYAH[mid - 1] < globalAyah) low = mid
    else high = mid - 1
  }
  return low
}

export const MUSHAF_PAGE_COUNT = 604
