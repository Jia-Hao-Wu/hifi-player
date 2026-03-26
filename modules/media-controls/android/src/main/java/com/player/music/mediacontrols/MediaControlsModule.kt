package com.player.music.mediacontrols

import android.content.Intent
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MediaControlsModule : Module() {
    private var serviceStarted = false

    override fun definition() = ModuleDefinition {
        Name("MediaControls")

        Events(
            "onMediaControlPlay",
            "onMediaControlPause",
            "onMediaControlNext",
            "onMediaControlPrevious",
            "onMediaControlSeekTo"
        )

        OnCreate {
            MediaControlsService.onCommand = { command, value ->
                when (command) {
                    "play" -> sendEvent("onMediaControlPlay", emptyMap<String, Any>())
                    "pause" -> sendEvent("onMediaControlPause", emptyMap<String, Any>())
                    "next" -> sendEvent("onMediaControlNext", emptyMap<String, Any>())
                    "previous" -> sendEvent("onMediaControlPrevious", emptyMap<String, Any>())
                    "seekTo" -> sendEvent("onMediaControlSeekTo", mapOf("position" to (value / 1000.0)))
                }
            }
        }

        OnDestroy {
            MediaControlsService.onCommand = null
        }

        Function("updateNowPlaying") { info: Map<String, Any?> ->
            ensureServiceStarted()

            val title = info["title"] as? String ?: ""
            val artist = info["artist"] as? String ?: ""
            val album = info["album"] as? String ?: ""
            val artworkUrl = info["artworkUrl"] as? String
            val duration = (info["duration"] as? Number)?.toLong() ?: 0L

            MediaControlsService.updateNowPlaying(
                title, artist, album, artworkUrl, duration * 1000L
            )
        }

        Function("updatePlaybackState") { state: Map<String, Any?> ->
            ensureServiceStarted()

            val isPlaying = state["isPlaying"] as? Boolean ?: false
            val position = (state["position"] as? Number)?.toLong() ?: 0L
            val playbackRate = (state["playbackRate"] as? Number)?.toFloat() ?: 1f

            MediaControlsService.updatePlaybackState(
                isPlaying, position * 1000L, playbackRate
            )
        }

        Function("stop") {
            MediaControlsService.stopService()
            serviceStarted = false
        }
    }

    private fun ensureServiceStarted() {
        if (serviceStarted) return
        val context = appContext.reactContext ?: return
        val intent = Intent(context, MediaControlsService::class.java)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent)
        } else {
            context.startService(intent)
        }
        serviceStarted = true
    }
}
