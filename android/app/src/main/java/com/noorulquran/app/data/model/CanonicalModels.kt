package com.noorulquran.app.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Mirrors the canonical Surah metadata entry in canonical-quran.json. */
@Serializable
data class CanonicalSurah(
    @SerialName("n") val number: Int,
    @SerialName("ar") val nameArabic: String,
    @SerialName("tr") val nameTransliterated: String,
    @SerialName("tx") val nameTranslation: String,
    @SerialName("ur") val nameTranslationUrdu: String = "",
    @SerialName("rev") val revelationType: String,
    @SerialName("count") val numberOfAyahs: Int,
)

/** Mirrors each verse entry in canonical-quran.json. */
@Serializable
data class CanonicalVerse(
    @SerialName("k") val key: String,
    @SerialName("t") val arabic: String,
    @SerialName("p") val page: Int,
    @SerialName("j") val juz: Int,
    @SerialName("h") val hizb: Int,
    @SerialName("r") val rubElHizb: Int,
    @SerialName("rk") val ruku: Int,
    @SerialName("m") val manzil: Int,
    @SerialName("s") val sajdah: Int? = null,
    @SerialName("sn") val surahNumber: Int,
    @SerialName("an") val ayahNumber: Int,
)

@Serializable
data class CanonicalDataset(
    val meta: CanonicalMeta,
    val surahs: List<CanonicalSurah>,
    val verses: List<CanonicalVerse>,
)

@Serializable
data class CanonicalMeta(
    val generatedAt: String,
    val script: String,
    val source: CanonicalSource,
    val lineage: String,
    val license: String,
    val checksum: String,
    val counts: CanonicalCounts,
)

@Serializable
data class CanonicalSource(
    val text: String,
    val navigation: String,
    val chapters: String,
    val crossCheck: String,
)

@Serializable
data class CanonicalCounts(
    val surahs: Int,
    val ayahs: Int,
    val pages: Int,
    val juzs: Int,
)
