package com.noorulquran.app.audio

import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService

/**
 * Media3 foreground service that owns the playback notification.
 *
 * It wraps the process-wide [NoorulQuranPlayer] (the same instance the in-app
 * [AudioController] drives), so playback started from the UI automatically
 * drives the notification (play/pause, prev/next, seek bar) on the lock screen
 * and in the notification shade, and keeps playing while the app is backgrounded.
 *
 * POST_NOTIFICATIONS is requested from the UI before audio starts (Android 13+).
 *
 * NOTE: the shared player is intentionally NOT released here -- it is process
 * scoped and outlives the service.
 */
class PlaybackService : MediaSessionService() {

    private var mediaSession: MediaSession? = null

    override fun onCreate() {
        super.onCreate()
        val player = NoorulQuranPlayer.get(this)
        mediaSession = MediaSession.Builder(this, player).build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? =
        mediaSession

    override fun onDestroy() {
        mediaSession?.release()
        mediaSession = null
        super.onDestroy()
    }
}