package com.noorulquran.app.audio

import android.content.Context
import androidx.media3.exoplayer.ExoPlayer

/**
 * Process-wide ExoPlayer shared by the in-app [AudioController] and the
 * [PlaybackService] media session.
 *
 * The notification / lock-screen / notification-shade controls are driven by
 * the MediaSession that wraps THIS player, so activity-driven playback and the
 * foreground service MUST reference the same instance. If each creates its own
 * player, the service's idle player never starts and no notification appears.
 *
 * The player lives for the whole process; it is released only when the app
 * process is torn down, never per-activity.
 */
object NoorulQuranPlayer {

    @Volatile
    private var instance: ExoPlayer? = null

    fun get(context: Context): ExoPlayer =
        instance ?: synchronized(this) {
            instance ?: ExoPlayer.Builder(context.applicationContext)
                .build()
                .also { instance = it }
        }
}