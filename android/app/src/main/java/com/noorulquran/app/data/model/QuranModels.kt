package com.noorulquran.app.data.model

/** User-facing surah model used across UI screens. */
data class Surah(
    val number: Int,
    val nameArabic: String,
    val nameTransliterated: String,
    val nameTranslation: String,
    val nameTranslationUrdu: String,
    val revelationType: RevelationType,
    val numberOfAyahs: Int,
)

enum class RevelationType(val label: String) {
    MECCAN("Meccan"),
    MEDINAN("Medinan"),
    UNKNOWN("");

    companion object {
        fun from(value: String): RevelationType = when (value.lowercase()) {
            "meccan" -> MECCAN
            "medinan" -> MEDINAN
            else -> UNKNOWN
        }
    }
}

/** A single ayah with its navigation metadata (page/juz/hizb/etc.). */
data class Ayah(
    val key: String,
    val surahNumber: Int,
    val ayahNumber: Int,
    val arabic: String,
    val page: Int,
    val juz: Int,
    val hizb: Int,
    val rubElHizb: Int,
    val ruku: Int,
    val manzil: Int,
    val sajdah: Int?,
)

/** A surah with its full ayah list (loaded from the bundled canonical dataset). */
data class SurahDetail(
    val surah: Surah,
    val ayahs: List<Ayah>,
)
