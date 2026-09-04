package com.noorulquran.app.audio

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Thin wrapper on the process-wide ExoPlayer exposing playback state as
 * StateFlows so Compose UI can bind to the currently playing item and progress.
 * The player is shared with the [PlaybackService] MediaSession, so the
 * lock-screen/shade notification stays in sync and keeps working while the app
 * is backgrounded.
 */
class AudioController(context: Context) {

    private val appContext = context.applicationContext

    val player: ExoPlayer = NoorulQuranPlayer.get(appContext)

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying

    data class PlaybackItem(
        val title: String,
        val artist: String,
        val artwork: String?,
        val surah: Int?,
        val ayah: Int?,
        val mediaItem: MediaItem,
    )

    private val _queue = MutableStateFlow<List<PlaybackItem>>(emptyList())
    val queue: StateFlow<List<PlaybackItem>> = _queue

    private val _currentIndex = MutableStateFlow(-1)
    val currentIndex: StateFlow<Int> = _currentIndex

    val currentItem: PlaybackItem?
        get() = _queue.value.getOrNull(_currentIndex.value)

    init {
        player.addListener(object : Player.Listener {
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                _isPlaying.value = isPlaying
            }
            override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
                _currentIndex.value = _queue.value.indexOfFirst { it.mediaItem == mediaItem }
            }
        })
    }

    fun playQueue(items: List<PlaybackItem>, startIndex: Int, isContinuous: Boolean) {
        startPlaybackService()
        player.setMediaItems(items.map { it.mediaItem }, startIndex, 0L)
        player.prepare()
        player.repeatMode = if (isContinuous) Player.REPEAT_MODE_ALL else Player.REPEAT_MODE_OFF
        _queue.value = items
        player.play()
    }

    /**
     * Puts the [PlaybackService] into the foreground so the MediaSession
     * notification appears (lock-screen + shade with transport controls).
     * Media3's MediaSessionService calls startForeground as soon as playback
     * begins, which the system requires to be preceded by startForegroundService.
     */
    private fun startPlaybackService() {
        val intent = Intent(appContext, PlaybackService::class.java)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                appContext.startForegroundService(intent)
            } else {
                appContext.startService(intent)
            }
        } catch (_: RuntimeException) {
            // Foreground service launch can be blocked by the OS (background
            // start restrictions, OEM battery savers). Playback still works
            // from the foreground UI; only the notification is skipped.
        }
    }

    fun toggle() = if (player.isPlaying) player.pause() else player.play()
    fun pause() = player.pause()
    fun resume() = player.play()
    fun stop() = player.stop()
    fun seekTo(posMs: Long) = player.seekTo(posMs)
    fun seekForward(ms: Long = 30_000) = player.seekTo((player.currentPosition + ms).coerceAtLeast(0))
    fun seekBackward(ms: Long = 30_000) = player.seekTo((player.currentPosition - ms).coerceAtLeast(0))
    fun next() = if (player.hasNextMediaItem()) player.seekToNext() else null
    fun prev() = player.seekToPrevious()
    fun setRate(rate: Float) {
        player.setPlaybackSpeed(rate.coerceAtLeast(0f))
    }

    fun clearQueue() {
        player.stop()
        player.clearMediaItems()
        _queue.value = emptyList()
        _currentIndex.value = -1
    }

    fun mediaItem(url: String, title: String, artist: String, artwork: String?): MediaItem {
        val meta = MediaMetadata.Builder()
            .setTitle(title)
            .setArtist(artist)
            .setAlbumTitle("NoorulQuran")
            .apply { artwork?.let { setArtworkUri(Uri.parse(it)) } }
            .build()
        return MediaItem.Builder().setUri(url).setMediaMetadata(meta).build()
    }
}
