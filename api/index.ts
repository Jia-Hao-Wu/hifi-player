/**
 * Public API surface for the Monochrome integration layer.
 *
 * Import from `@/api` — never from individual sub-modules outside this folder.
 * Internal helpers (pickInstance, markFailed, apiGet, …) are not re-exported.
 */

// Images
export { ARTWORK_SIZES, artworkUrl } from "./images";
export type { ArtworkSize } from "./images";

// Search
export { searchAlbums, searchArtists, searchPlaylists, searchTracks } from "./search";
export type {
	SearchAlbum,
	SearchArtist,
	SearchOptions,
	SearchPage,
	SearchPlaylist,
	SearchTrack
} from "./search";

// Stream resolution
export { getTrackStream, resolveStreamUrl } from "./track";
export type { StreamQuality } from "./track";

// Full-detail metadata
export {
	getAlbumDetail,
	getArtistDetail,
	getRecommendations,
	getTrackInfo
} from "./metadata";
export type {
	AlbumDetail,
	AlbumMeta,
	ArtistDetail,
	ArtistMeta,
	Recommendation,
	TrackInfo
} from "./metadata";

// Error type
export { ApiError } from "./client";
