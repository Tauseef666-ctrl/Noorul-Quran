package com.noorulquran.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "bookmarks")
data class BookmarkEntity(
    @PrimaryKey val key: String,          // "surah:ayah"
    val surahNumber: Int,
    val ayahNumber: Int,
    val createdAt: Long,
)

@Entity(tableName = "notes")
data class NoteEntity(
    @PrimaryKey val key: String,          // "surah:ayah"
    val surahNumber: Int,
    val ayahNumber: Int,
    val text: String,
    val updatedAt: Long,
)

/**
 * A downloaded item (surah or juz) for offline reading/listening.
 * kind: "surah" | "juz"
 */
@Entity(tableName = "downloads")
data class DownloadEntity(
    @PrimaryKey val id: String,           // "surah:1" | "juz:5"
    val kind: String,                     // "surah" | "juz"
    val number: Int,
    val title: String,
    val audioDownloaded: Boolean,
    val bytesUsed: Long,
    val createdAt: Long,
)

@Entity(tableName = "reading_plans")
data class ReadingPlanEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val dailyTarget: Int,                 // ayahs per day
    val startDate: String,                // ISO date
    val enrolledAt: Long,
)

@Entity(tableName = "daily_progress")
data class DailyProgressEntity(
    @PrimaryKey val date: String,         // ISO date
    val planId: Long,
    val ayahsCompleted: Int,
    val lastSurah: Int,
    val lastAyah: Int,
)
