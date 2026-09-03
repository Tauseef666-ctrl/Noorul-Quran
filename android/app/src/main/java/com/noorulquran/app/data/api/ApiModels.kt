package com.noorulquran.app.data.api

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// Al Quran Cloud API v1 models
@Serializable
data class AqcResponse<T>(val code: Int, val status: String, val data: T)

@Serializable
data class AqcAyahData(val number: Int, val text: String, val surah: AqcSurah)

@Serializable
data class AqcSurah(val number: Int, val name: String, val englishName: String)

@Serializable
data class AqcEdition(
    val identifier: String,
    val language: String,
    val name: String,
    val englishName: String,
)

@Serializable
data class AqcEditionListData(
    val editions: List<AqcEdition>,
)

/** Multi-edition ayah translation payload from /ayah/{n}/editions/{ids}. */
@Serializable
class TranslationPayload(
    val number: Int = 0,
    val text: String = "",
    @SerialName("edition") val edition: TranslationEditionIdentifier? = null,
)

@Serializable
data class TranslationEditionIdentifier(
    val identifier: String = "",
    val language: String = "",
    val name: String = "",
    val englishName: String = "",
)

// Tafsir models from Quran Foundation (quran.com) API
@Serializable
data class TafsirResource(
    val resourceId: Int,
    val language: String,
    @SerialName("author_name") val authorName: String,
)

@Serializable
data class TafsirAyah(
    val resourceId: Int,
    val language: String,
    val text: String,
    val shortText: String,
)
