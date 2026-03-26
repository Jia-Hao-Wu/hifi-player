package com.player.music.mediacontrols

import android.os.Looper
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.common.SimpleBasePlayer
import androidx.media3.common.util.UnstableApi
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture

/**
 * A virtual player that doesn't play audio — it just reports state
 * provided from JS to the MediaSession. Actual playback is handled
 * by expo-audio.
 */
@OptIn(UnstableApi::class)
class VirtualPlayer(
    looper: Looper,
    private val onCommand: (String, Long) -> Unit
) : SimpleBasePlayer(looper) {

    private var currentTitle: String = ""
    private var currentArtist: String = ""
    private var currentAlbum: String = ""
    private var currentArtworkUri: String? = null
    private var currentDurationMs: Long = 0L
    private var currentPositionMs: Long = 0L
    private var currentIsPlaying: Boolean = false
    private var currentPlaybackRate: Float = 1f

    fun updateMetadata(
        title: String,
        artist: String,
        album: String,
        artworkUri: String?,
        durationMs: Long
    ) {
        currentTitle = title
        currentArtist = artist
        currentAlbum = album
        currentArtworkUri = artworkUri
        currentDurationMs = durationMs
        invalidateState()
    }

    fun updateState(isPlaying: Boolean, positionMs: Long, playbackRate: Float = 1f) {
        currentIsPlaying = isPlaying
        currentPositionMs = positionMs
        currentPlaybackRate = playbackRate
        invalidateState()
    }

    override fun getState(): State {
        val mediaItemBuilder = MediaItem.Builder()
            .setMediaId("current")
            .setMediaMetadata(
                MediaMetadata.Builder()
                    .setTitle(currentTitle)
                    .setArtist(currentArtist)
                    .setAlbumTitle(currentAlbum)
                    .apply {
                        currentArtworkUri?.let {
                            setArtworkUri(android.net.Uri.parse(it))
                        }
                    }
                    .build()
            )
            .build()

        val playlistItem = MediaItemData.Builder("current")
            .setMediaItem(mediaItemBuilder)
            .setDurationUs(currentDurationMs * 1000L)
            .build()

        return State.Builder()
            .setAvailableCommands(
                Player.Commands.Builder()
                    .addAll(
                        Player.COMMAND_PLAY_PAUSE,
                        Player.COMMAND_SEEK_IN_CURRENT_MEDIA_ITEM,
                        Player.COMMAND_SEEK_TO_NEXT,
                        Player.COMMAND_SEEK_TO_PREVIOUS,
                        Player.COMMAND_GET_CURRENT_MEDIA_ITEM,
                        Player.COMMAND_GET_METADATA,
                        Player.COMMAND_GET_MEDIA_ITEMS_METADATA
                    )
                    .build()
            )
            .setPlayWhenReady(currentIsPlaying, PLAY_WHEN_READY_CHANGE_REASON_USER_REQUEST)
            .setPlaybackState(if (currentDurationMs > 0) Player.STATE_READY else Player.STATE_IDLE)
            .setContentPositionMs(currentPositionMs)
            .setPlaylist(listOf(playlistItem))
            .setPlaybackParameters(
                androidx.media3.common.PlaybackParameters(currentPlaybackRate)
            )
            .build()
    }

    override fun handleSetPlayWhenReady(playWhenReady: Boolean): ListenableFuture<*> {
        onCommand(if (playWhenReady) "play" else "pause", 0L)
        return Futures.immediateVoidFuture()
    }

    override fun handleSeek(
        mediaItemIndex: Int,
        positionMs: Long,
        seekCommand: Int
    ): ListenableFuture<*> {
        when (seekCommand) {
            Player.COMMAND_SEEK_TO_NEXT -> onCommand("next", 0L)
            Player.COMMAND_SEEK_TO_PREVIOUS -> onCommand("previous", 0L)
            else -> onCommand("seekTo", positionMs)
        }
        return Futures.immediateVoidFuture()
    }
}
