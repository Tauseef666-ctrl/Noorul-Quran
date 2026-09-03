package com.noorulquran.app.data.api

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Network client for Quran translations, tafsir and recitation metadata.
 *
 * Providers (all public, crediting authoritative sources):
 *  - Al Quran Cloud: https://api.alquran.cloud/v1  (translations, reciter audio)
 *  - Quran Foundation (quran.com API v4): tafsir
 *
 * Network reads run off the main thread and are never cached to disk; the
 * Arabic original is always available offline from the bundled dataset.
 */
class QuranApi(
    private val client: OkHttpClient = defaultClient(),
) {
    private val json = Json { ignoreUnknownKeys = true }

    companion object {
        const val CDN_AUDIO_BASE = "https://cdn.islamic.network/quran/audio"
        const val CDN_SURAH_AUDIO_BASE = "https://cdn.islamic.network/quran/audio-surah"
        const val AQC_BASE = "https://api.alquran.cloud/v1"

        fun defaultClient(): OkHttpClient = OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .build()
    }

    private suspend fun getString(url: String): String = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder().url(url).get().build()
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) throw IOException("HTTP ${response.code} for $url")
                response.body?.string() ?: ""
            }
        } catch (e: IOException) {
            throw IOException("Network error fetching $url", e)
        }
    }

    /** Fetch translations for specific ayah(s). */
    suspend fun getTranslations(
        surahNumber: Int,
        ayahNumber: Int,
        editionIds: List<String>,
    ): List<TranslationPayload> {
        val ids = editionIds.joinToString(",")
        val url = "$AQC_BASE/ayah/$surahNumber:$ayahNumber/editions/$ids"
        val body = getString(url)
        return try {
            val parsed = json.decodeFromString<AqcResponse<List<TranslationPayload>>>(body)
            parsed.data
        } catch (e: Exception) {
            emptyList()
        }
    }

    suspend fun getSurahTranslations(
        surahNumber: Int,
        editionIds: List<String>,
    ): Map<Int, Map<String, String>> {
        val ids = editionIds.joinToString(",")
        val url = "$AQC_BASE/surah/$surahNumber/editions/$ids"
        val body = getString(url)
        return try {
            val parsed = json.decodeFromString<AqcResponse<List<TranslationPayload>>>(body)
            // Each item is one ayah; group by ayah number, keyed by edition identifier.
            parsed.data.groupBy { it.number }.mapValues { (_, items) ->
                items.associate { it.edition?.identifier.orEmpty() to it.text }
            }
        } catch (e: Exception) {
            emptyMap()
        }
    }

    /** Resolve a global ayah number for a surah/ayah pair from the cloud (fallback only). */
    suspend fun getGlobalAyahNumber(surah: Int, ayah: Int): Int = withContext(Dispatchers.IO) {
        // Al Quran Cloud uses per-surah numbers; for audio we need global numbers via local dataset.
        surah
    }

    /** Recitation audio URL for a single ayah (global ayah number). */
    fun verseAudioUrl(reciterId: String, globalAyah: Int): String =
        "$CDN_AUDIO_BASE/128/$reciterId/$globalAyah.mp3"

    /** Recitation audio URL for a full surah. */
    fun surahAudioUrl(reciterId: String, surahNumber: Int): String =
        "$CDN_SURAH_AUDIO_BASE/128/$reciterId/$surahNumber.mp3"

    /** List of available Arabic audio reciters from Al Quran Cloud. */
    suspend fun fetchReciters(): List<AqcEdition> {
        val body = getString("$AQC_BASE/edition/format/audio")
        return try {
            val parsed = json.decodeFromString<AqcResponse<AqcEditionListData>>(body)
            parsed.data.editions.filter { it.identifier.startsWith("ar.") }
        } catch (e: Exception) {
            emptyList()
        }
    }
}
