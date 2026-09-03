package com.noorulquran.app

import android.app.Application
import com.noorulquran.app.data.api.QuranApi
import com.noorulquran.app.data.local.AppDatabase
import com.noorulquran.app.data.local.DownloadManager
import com.noorulquran.app.data.quran.QuranRepository
import com.noorulquran.app.prefs.SettingsStore

/** Manual dependency-injection container (keeps the app light, no DI framework). */
class AppContainer(context: Application) {
    val database: AppDatabase = AppDatabase.get(context)
    val settings: SettingsStore = SettingsStore(context)
    val quranRepository: QuranRepository = QuranRepository(context)
    val api: QuranApi = QuranApi()
    val downloadManager: DownloadManager = DownloadManager(context, database.downloadDao())
}

class NoorulQuranApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}
