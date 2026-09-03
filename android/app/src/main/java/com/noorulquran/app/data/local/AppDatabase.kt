package com.noorulquran.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        BookmarkEntity::class,
        NoteEntity::class,
        DownloadEntity::class,
        ReadingPlanEntity::class,
        DailyProgressEntity::class,
    ],
    version = 1,
    exportSchema = true,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun bookmarkDao(): BookmarkDao
    abstract fun noteDao(): NoteDao
    abstract fun downloadDao(): DownloadDao
    abstract fun readingPlanDao(): ReadingPlanDao
    abstract fun dailyProgressDao(): DailyProgressDao

    companion object {
        @Volatile
        private var instance: AppDatabase? = null

        fun get(context: Context): AppDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "noorulquran.db",
                ).build().also { instance = it }
            }
    }
}
