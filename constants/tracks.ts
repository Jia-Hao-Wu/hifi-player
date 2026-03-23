import type { TrackMeta } from "@/api";
import { ARTWORK_SIZES, artworkUrl } from "@/api";

/**
 * Minimal track shape used by the player throughout the app.
 *
 * `uri` is optional — for TIDAL tracks it is resolved lazily via
 * `getTrackStream(tidalId)` when playback starts.
 * `tidalId` is the raw TIDAL numeric ID used for API calls.
 */
export interface Track {
	id: string;
	title: string;
	artist: {
		id: string;
		name: string;
	};
	album: string;
	cover: string;
	artwork: string;
	uri?: string; // populated lazily for API tracks; present for local/demo tracks
	tidalId?: string; // TIDAL track ID — triggers lazy stream resolution when uri is absent
	duration?: number;
}

/**
 * Convert a Monochrome API search result into a player-compatible Track.
 * The `uri` is intentionally left empty so the player fetches the stream
 * URL only when the track is about to play.
 */
export function fromSearchTrack(track: TrackMeta): Track {
	return {
		id: String(track.id),
		tidalId: String(track.id),
		title: track.title,
		artist: track.artist ?? {
			name: "Unknown Artist"
		},
		album: track.album?.title ?? "",
		cover: track.album?.cover,
		artwork: artworkUrl(track.album?.cover, ARTWORK_SIZES.medium),
		duration: track.duration,
		// uri intentionally omitted — resolved lazily
	};
}
