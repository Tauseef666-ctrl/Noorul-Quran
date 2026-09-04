package com.noorulquran.app.audio

import android.content.Context
import android.net.Uri
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Thin ExoPlayer wrapper exposing playback state as StateFlows so Compose UI can
 * bind to the currently playing item and progress. The player drives the
 * MediaSessionService so the lock-screen/shade notification stays in sync.
 */
class AudioController(context: Context) {

    private val appContext = context.applicationContext

    val player: ExoPlayer = ExoPlayer.Builder(appContext).build()

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
        player.setMediaItems(items.map { it.mediaItem }, startIndex, 0L)
        player.prepare()
        player.repeatMode = if (isContinuous) Player.REPEAT_MODE_ALL else Player.REPEAT_MODE_OFF
        _queue.value = items
        player.play()
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
