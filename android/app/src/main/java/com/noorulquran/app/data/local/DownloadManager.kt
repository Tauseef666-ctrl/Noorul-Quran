package com.noorulquran.app.data.local

import android.content.Context
import com.noorulquran.app.data.api.QuranApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.IOException

/**
 * Manages offline downloads (surah/juz) for reading and listening.
 *
 * Audio files are written to the app's private storage (no storage permission
 * needed) and tracked in [DownloadDao]. The bundled canonical dataset already
 * makes Arabic reading fully offline; downloads primarily enable offline
 * listening of specific surahs/juz, and reading a surah/juz when the remote
 * translation is unavailable.
 */
class DownloadManager(
    private val context: Context,
    private val dao: DownloadDao,
    private val client: OkHttpClient = QuranApi.defaultClient(),
) {
    private val downloadsDir: File
        get() = File(context.filesDir, "downloads").apply { mkdirs() }

    fun audioFileFor(kind: String, number: Int, reciterId: String): File =
        File(downloadsDir, "${kind}_${number}_$reciterId.mp3")

    fun isAudioDownloaded(kind: String, number: Int, reciterId: String): Boolean {
        val f = File(downloadsDir, "${kind}_${number}_$reciterId.mp3")
        return dao.findById(downloadId(kind, number))?.audioDownloaded == true && f.exists()
    }

    fun downloadId(kind: String, number: Int): String = "$kind:$number"

    /** Downloads the audio for a surah or juz and records it in the DB. */
    suspend fun downloadAudio(
        kind: String,
        number: Int,
        reciterId: String,
        title: String,
        audioUrl: String,
        onProgress: (Float) -> Unit = {},
    ): Result<DownloadEntity> = withContext(Dispatchers.IO) {
        try {
            val target = audioFileFor(kind, number, reciterId)
            val tmp = File(target.path + ".part")
            val request = Request.Builder().url(audioUrl).get().build()
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) throw IOException("Download failed: HTTP ${response.code}")
                val body = response.body ?: throw IOException("Empty response body")
                val total = body.contentLength()
                var written = 0L
                body.byteStream().use { input ->
                    tmp.outputStream().use { output ->
                        val buffer = ByteArray(8 * 1024)
                        var read = input.read(buffer)
                        while (read != -1) {
                            output.write(buffer, 0, read)
                            written += read
                            if (total > 0) onProgress(written.toFloat() / total)
                            read = input.read(buffer)
                        }
                    }
                }
            }
            if (tmp.exists()) {
                if (target.exists()) target.delete()
                if (!tmp.renameTo(target)) throw IOException("Unable to finalize download")
            }
            val entity = DownloadEntity(
                id = downloadId(kind, number),
                kind = kind,
                number = number,
                title = title,
                audioDownloaded = true,
                bytesUsed = target.length(),
                createdAt = System.currentTimeMillis(),
            )
            dao.upsert(entity)
            Result.success(entity)
        } catch (e: Exception) {
            tmpFile(kind, number, reciterId)?.delete()
            Result.failure(e)
        }
    }

    private fun tmpFile(kind: String, number: Int, reciterId: String): File? {
        val target = audioFileFor(kind, number, reciterId)
        val tmp = File(target.path + ".part")
        return tmp
    }

    /** Deletes a download (audio file + DB record) for storage management. */
    suspend fun deleteDownload(kind: String, number: Int, reciterId: String) {
        val target = audioFileFor(kind, number, reciterId)
        val tmp = File(target.path + ".part")
        target.delete()
        tmp.delete()
        dao.deleteById(downloadId(kind, number))
    }

    suspend fun bytesUsedFor(kind: String, number: Int, reciterId: String): Long {
        val f = audioFileFor(kind, number, reciterId)
        return if (f.exists()) f.length() else 0
    }
}
