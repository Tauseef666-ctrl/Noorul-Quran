package com.noorulquran.app.prefs

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "settings")

/** User preferences persisted with DataStore. */
class SettingsStore(private val context: Context) {

    private object Keys {
        val DARK_MODE = stringPreferencesKey("dark_mode")      // "system" | "light" | "dark"
        val RECITER = stringPreferencesKey("reciter")
        val TRANSLATIONS = stringSetPreferencesKey("translations")
        val TAFSIR = stringPreferencesKey("tafsir")
        val ARABIC_SIZE = floatPreferencesKey("arabic_size")
        val UI_SIZE = floatPreferencesKey("ui_size")
        val PLAYBACK_RATE = floatPreferencesKey("playback_rate")
        val AUTO_NEXT = booleanPreferencesKey("auto_next")
        val REPEAT_AYAH = booleanPreferencesKey("repeat_ayah")
        val LAST_READ_SURAH = intPreferencesKey("last_read_surah")
        val LAST_READ_AYAH = intPreferencesKey("last_read_ayah")
    }

    val darkMode: Flow<String> = context.dataStore.data.map { it[Keys.DARK_MODE] ?: "system" }
    val reciter: Flow<String> = context.dataStore.data.map { it[Keys.RECITER] ?: "ar.alafasy" }
    val translations: Flow<Set<String>> = context.dataStore.data.map {
        it[Keys.TRANSLATIONS] ?: setOf("en.sahih", "ur.jalandhry")
    }
    val tafsir: Flow<String> = context.dataStore.data.map { it[Keys.TAFSIR] ?: "en-tafisr-ibn-kathir" }
    val arabicSize: Flow<Float> = context.dataStore.data.map { it[Keys.ARABIC_SIZE] ?: 1f }
    val uiSize: Flow<Float> = context.dataStore.data.map { it[Keys.UI_SIZE] ?: 1f }
    val playbackRate: Flow<Float> = context.dataStore.data.map { it[Keys.PLAYBACK_RATE] ?: 1f }
    val autoNext: Flow<Boolean> = context.dataStore.data.map { it[Keys.AUTO_NEXT] ?: true }
    val repeatAyah: Flow<Boolean> = context.dataStore.data.map { it[Keys.REPEAT_AYAH] ?: false }
    val lastReadSurah: Flow<Int> = context.dataStore.data.map { it[Keys.LAST_READ_SURAH] ?: 1 }
    val lastReadAyah: Flow<Int> = context.dataStore.data.map { it[Keys.LAST_READ_AYAH] ?: 1 }

    suspend fun setDarkMode(value: String) = context.dataStore.edit { it[Keys.DARK_MODE] = value }
    suspend fun setReciter(value: String) = context.dataStore.edit { it[Keys.RECITER] = value }
    suspend fun setTranslations(value: Set<String>) = context.dataStore.edit { it[Keys.TRANSLATIONS] = value }
    suspend fun setTafsir(value: String) = context.dataStore.edit { it[Keys.TAFSIR] = value }
    suspend fun setArabicSize(value: Float) = context.dataStore.edit { it[Keys.ARABIC_SIZE] = value }
    suspend fun setUiSize(value: Float) = context.dataStore.edit { it[Keys.UI_SIZE] = value }
    suspend fun setPlaybackRate(value: Float) = context.dataStore.edit { it[Keys.PLAYBACK_RATE] = value }
    suspend fun setAutoNext(value: Boolean) = context.dataStore.edit { it[Keys.AUTO_NEXT] = value }
    suspend fun setRepeatAyah(value: Boolean) = context.dataStore.edit { it[Keys.REPEAT_AYAH] = value }
    suspend fun setLastRead(surah: Int, ayah: Int) = context.dataStore.edit {
        it[Keys.LAST_READ_SURAH] = surah
        it[Keys.LAST_READ_AYAH] = ayah
    }
}
