package com.noorulquran.app.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface BookmarkDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(bookmark: BookmarkEntity)

    @Delete
    suspend fun delete(bookmark: BookmarkEntity)

    @Query("DELETE FROM bookmarks WHERE `key` = :key")
    suspend fun deleteByKey(key: String)

    @Query("SELECT * FROM bookmarks ORDER BY createdAt DESC")
    fun observeAll(): Flow<List<BookmarkEntity>>

    @Query("SELECT * FROM bookmarks WHERE `key` = :key")
    suspend fun findByKey(key: String): BookmarkEntity?

    @Query("SELECT COUNT(*) FROM bookmarks")
    fun count(): Flow<Int>

    @Query("DELETE FROM bookmarks")
    suspend fun clear()
}

@Dao
interface NoteDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(note: NoteEntity)

    @Delete
    suspend fun delete(note: NoteEntity)

    @Query("DELETE FROM notes WHERE `key` = :key")
    suspend fun deleteByKey(key: String)

    @Query("SELECT * FROM notes ORDER BY updatedAt DESC")
    fun observeAll(): Flow<List<NoteEntity>>

    @Query("SELECT * FROM notes WHERE `key` = :key")
    suspend fun findByKey(key: String): NoteEntity?

    @Query("SELECT * FROM notes WHERE surahNumber = :surah AND ayahNumber = :ayah")
    suspend fun findBySurahAyah(surah: Int, ayah: Int): NoteEntity?
}

@Dao
interface DownloadDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(download: DownloadEntity)

    @Delete
    suspend fun delete(download: DownloadEntity)

    @Query("DELETE FROM downloads WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("SELECT * FROM downloads ORDER BY createdAt DESC")
    fun observeAll(): Flow<List<DownloadEntity>>

    @Query("SELECT * FROM downloads WHERE id = :id")
    suspend fun findById(id: String): DownloadEntity?

    @Query("SELECT SUM(bytesUsed) FROM downloads")
    suspend fun totalBytes(): Long?
}

@Dao
interface ReadingPlanDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(plan: ReadingPlanEntity): Long

    @Delete
    suspend fun delete(plan: ReadingPlanEntity)

    @Query("SELECT * FROM reading_plans ORDER BY enrolledAt DESC")
    fun observeAll(): Flow<List<ReadingPlanEntity>>

    @Query("SELECT * FROM reading_plans WHERE id = :id")
    suspend fun findById(id: Long): ReadingPlanEntity?
}

@Dao
interface DailyProgressDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(progress: DailyProgressEntity)

    @Query("SELECT * FROM daily_progress WHERE planId = :planId ORDER BY date DESC")
    fun observeForPlan(planId: Long): Flow<List<DailyProgressEntity>>

    @Query("SELECT * FROM daily_progress WHERE date = :date AND planId = :planId")
    suspend fun findByDate(date: String, planId: Long): DailyProgressEntity?
}
