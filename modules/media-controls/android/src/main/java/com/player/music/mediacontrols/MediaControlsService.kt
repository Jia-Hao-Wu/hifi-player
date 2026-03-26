package com.player.music.mediacontrols

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.annotation.OptIn
import androidx.core.app.NotificationCompat
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaStyleNotificationHelper
import kotlinx.coroutines.*
import java.net.URL

@OptIn(UnstableApi::class)
class MediaControlsService : android.app.Service() {

    companion object {
        private const val CHANNEL_ID = "media_controls_channel"
        private const val NOTIFICATION_ID = 9999

        private var instance: MediaControlsService? = null

        var onCommand: ((String, Long) -> Unit)? = null

        fun updateNowPlaying(
            title: String,
            artist: String,
            album: String,
            artworkUrl: String?,
            durationMs: Long
        ) {
            instance?.let { svc ->
                svc.mainHandler.post {
                    svc.updateNowPlayingInternal(title, artist, album, artworkUrl, durationMs)
                }
            }
        }

        fun updatePlaybackState(isPlaying: Boolean, positionMs: Long, playbackRate: Float) {
            instance?.let { svc ->
                svc.mainHandler.post {
                    svc.updatePlaybackStateInternal(isPlaying, positionMs, playbackRate)
                }
            }
        }

        fun stopService() {
            instance?.stopSelf()
        }
    }

    private var mediaSession: MediaSession? = null
    private var virtualPlayer: VirtualPlayer? = null
    private var currentArtwork: Bitmap? = null
    private var artworkLoadJob: Job? = null
    private var currentArtworkUrl: String? = null
    private val scope = CoroutineScope(Dispatchers.IO)
    private val mainHandler = Handler(Looper.getMainLooper())

    private var currentTitle: String = ""
    private var currentArtist: String = ""

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannel()
        initializePlayer()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onBind(intent: Intent?) = null

    override fun onDestroy() {
        instance = null
        mediaSession?.release()
        mediaSession = null
        virtualPlayer = null
        artworkLoadJob?.cancel()
        scope.cancel()
        super.onDestroy()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (manager.getNotificationChannel(CHANNEL_ID) == null) {
                manager.createNotificationChannel(
                    NotificationChannel(
                        CHANNEL_ID,
                        "Media Playback",
                        NotificationManager.IMPORTANCE_LOW
                    ).apply {
                        description = "Media playback controls"
                    }
                )
            }
        }
    }

    private fun initializePlayer() {
        val player = VirtualPlayer(Looper.getMainLooper()) { command, value ->
            onCommand?.invoke(command, value)
        }
        virtualPlayer = player

        mediaSession = MediaSession.Builder(this, player)
            .setCallback(MediaSessionCallback())
            .build()
    }

    private fun updateNowPlayingInternal(
        title: String,
        artist: String,
        album: String,
        artworkUrl: String?,
        durationMs: Long
    ) {
        currentTitle = title
        currentArtist = artist

        virtualPlayer?.updateMetadata(title, artist, album, artworkUrl, durationMs)

        if (artworkUrl != null && artworkUrl != currentArtworkUrl) {
            currentArtworkUrl = artworkUrl
            loadArtwork(artworkUrl)
        } else {
            postNotification(startForeground = true)
        }
    }

    private fun updatePlaybackStateInternal(isPlaying: Boolean, positionMs: Long, playbackRate: Float) {
        virtualPlayer?.updateState(isPlaying, positionMs, playbackRate)
        postNotification(startForeground = isPlaying)
    }

    private fun loadArtwork(url: String) {
        artworkLoadJob?.cancel()
        artworkLoadJob = scope.launch {
            try {
                val inputStream = URL(url).openConnection().getInputStream()
                val bitmap = BitmapFactory.decodeStream(inputStream)
                if (isActive) {
                    currentArtwork = bitmap
                    withContext(Dispatchers.Main) {
                        postNotification(startForeground = true)
                    }
                }
            } catch (_: Exception) {
                currentArtwork = null
                withContext(Dispatchers.Main) {
                    postNotification(startForeground = true)
                }
            }
        }
    }

    private fun buildNotification(): Notification? {
        val session = mediaSession ?: return null

        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val contentIntent = if (launchIntent != null) {
            PendingIntent.getActivity(
                this, 0, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        } else null

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(androidx.media3.session.R.drawable.media3_icon_circular_play)
            .setContentTitle(currentTitle.ifEmpty { "\u200E" })
            .setContentText(currentArtist)
            .setLargeIcon(currentArtwork)
            .setContentIntent(contentIntent)
            .setAutoCancel(false)
            .setOngoing(true)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setStyle(MediaStyleNotificationHelper.MediaStyle(session))
            .build()
    }

    private fun postNotification(startForeground: Boolean) {
        val notification = buildNotification() ?: return

        if (startForeground) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    startForeground(
                        NOTIFICATION_ID,
                        notification,
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
                    )
                } else {
                    startForeground(NOTIFICATION_ID, notification)
                }
            } catch (_: Exception) {
                // Foreground service start may fail on some devices
            }
        } else {
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.notify(NOTIFICATION_ID, notification)
        }
    }
}
