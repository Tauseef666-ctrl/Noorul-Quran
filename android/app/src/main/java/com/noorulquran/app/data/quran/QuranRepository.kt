package com.noorulquran.app.data.quran

import android.content.Context
import com.noorulquran.app.data.model.Ayah
import com.noorulquran.app.data.model.CanonicalDataset
import com.noorulquran.app.data.model.RevelationType
import com.noorulquran.app.data.model.Surah
import com.noorulquran.app.data.model.SurahDetail
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json

/**
 * Loads and serves the bundled canonical Uthmani Quran dataset.
 *
 * The dataset is generated from authoritative sources (Quran.com API v4,
 * cross-checked against Al Quran Cloud) and bundled as an app asset so every
 * verse's Arabic text is available fully offline with zero risk of upstream
 * mutation. Data integrity is verified at generation time via SHA-256.
 *
 * All reads are synchronous after the first load; the heavy one-time parse is
 * offloaded off the main thread.
 */
class QuranRepository(private val context: Context) {

    private val json = Json { ignoreUnknownKeys = true }

    @Volatile
    private var dataset: CanonicalDataset? = null

    private suspend fun load(): CanonicalDataset {
        dataset?.let { return it }
        return withContext(Dispatchers.IO) {
            dataset?.let { return@withContext it }
            val text = context.assets.open("canonical-quran.json")
                .bufferedReader(Charsets.UTF_8)
                .use { it.readText() }
            val parsed = json.decodeFromString<CanonicalDataset>(text)
            dataset = parsed
            parsed
        }
    }

    suspend fun getSurahList(): List<Surah> = withContext(Dispatchers.Default) {
        load().surahs.map { meta ->
            Surah(
                number = meta.number,
                nameArabic = meta.nameArabic,
                nameTransliterated = meta.nameTransliterated,
                nameTranslation = meta.nameTranslation,
                nameTranslationUrdu = meta.nameTranslationUrdu,
                revelationType = RevelationType.from(meta.revelationType),
                numberOfAyahs = meta.numberOfAyahs,
            )
        }
    }

    fun surahFromMeta(meta: CanonicalDataset, number: Int): Surah? {
        val m = meta.surahs.getOrNull(number - 1) ?: return null
        return Surah(
            number = m.number,
            nameArabic = m.nameArabic,
            nameTransliterated = m.nameTransliterated,
            nameTranslation = m.nameTranslation,
            nameTranslationUrdu = m.nameTranslationUrdu,
            revelationType = RevelationType.from(m.revelationType),
            numberOfAyahs = m.numberOfAyahs,
        )
    }

    suspend fun getSurah(number: Int): SurahDetail? = withContext(Dispatchers.Default) {
        val d = load()
        val meta = d.surahs.getOrNull(number - 1) ?: return@withContext null
        val surah = surahFromMeta(d, number) ?: return@withContext null
        val ayahs = d.verses.filter { it.surahNumber == number }.map { it.toAyah() }
        SurahDetail(surah = surah, ayahs = ayahs)
    }

    suspend fun getAyah(surahNumber: Int, ayahNumber: Int): Ayah? = withContext(Dispatchers.Default) {
        load().verses.firstOrNull { it.surahNumber == surahNumber && it.ayahNumber == ayahNumber }?.toAyah()
    }

    suspend fun getJuz(juzNumber: Int): List<Ayah> = withContext(Dispatchers.Default) {
        load().verses.filter { it.juz == juzNumber }.map { it.toAyah() }
    }

    suspend fun getJuzStartSurah(juzNumber: Int): Int? =
        getJuz(juzNumber).firstOrNull()?.surahNumber

    suspend fun getPage(pageNumber: Int): List<Ayah> = withContext(Dispatchers.Default) {
        load().verses.filter { it.page == pageNumber }.map { it.toAyah() }
    }

    /** All ayahs that fall within a surah's page range, indexed by page (1..604). */
    suspend fun getSurahPageRange(number: Int): Pair<Int, Int>? = withContext(Dispatchers.Default) {
        val d = load()
        val pages = d.verses.filter { it.surahNumber == number }.map { it.page }
        if (pages.isEmpty()) null else pages.first() to pages.last()
    }

    /** Total number of pages in the Uthmani mushaf (604). */
    suspend fun totalPages(): Int = withContext(Dispatchers.Default) {
        load().meta.counts.pages
    }

    /**
     * Per-surah ayah counts, indexed by surah number (1..114).
     * Mirrors the web app's AYAH_COUNTS array.
     */
    suspend fun ayahCounts(): IntArray = withContext(Dispatchers.Default) {
        val d = load()
        val arr = IntArray(d.surahs.maxOfOrNull { it.number }?.plus(1) ?: 115)
        for (meta in d.surahs) arr[meta.number] = meta.numberOfAyahs
        arr
    }

    /** Converts surah:ayah to the global 1..6236 ayah number (used for audio URLs). */
    suspend fun globalAyahNumber(surahNumber: Int, ayahNumber: Int): Int =
        withContext(Dispatchers.Default) {
            val counts = ayahCounts()
            var sum = 0
            for (s in 1 until surahNumber) sum += counts.getOrElse(s) { 0 }
            sum + ayahNumber
        }

    private fun com.noorulquran.app.data.model.CanonicalVerse.toAyah() = Ayah(
        key = key,
        surahNumber = surahNumber,
        ayahNumber = ayahNumber,
        arabic = arabic,
        page = page,
        juz = juz,
        hizb = hizb,
        rubElHizb = rubElHizb,
        ruku = ruku,
        manzil = manzil,
        sajdah = sajdah,
    )
}
