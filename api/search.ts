import { apiGet } from "./client";

// Response shapes
export interface SearchResponse<T> {
	version: string;
	data: T;
}

export interface SearchArtist {
	id: string;
	name: string;
	picture: string | null;
}

export interface SearchCreator {
	id: number;
	name: string;
}

export interface SearchAlbum {
	id: number;
	title: string;
	duration: number;
	streamReady: boolean;
	payToStream: boolean;
	adSupportedStreamReady: boolean;
	djReady: boolean;
	stemReady: boolean;
	streamStartDate: string;
	allowStreaming: boolean;
	premiumStreamingOnly: boolean;
	numberOfTracks: number;
	numberOfVideos: number;
	numberOfVolumes: number;
	releaseDate: string;
	copyright: string;
	type: string;
	version?: string;
	url: string;
	cover: string;
	vibrantColor: string;
	videoCover?: string;
	explicit: boolean;
	upc: string;
	popularity: number;
	audioQuality: string;
	audioModes: string[];
	mediaMetadata: {
		tags: string[];
	};
	upload: boolean;
	artists: SearchArtist[]
}

export interface SearchTrack {
	id: string;
	title: string;
	duration: number;
	explicit: boolean;
	artist: SearchArtist;
	album: SearchAlbum;
	audioQuality?: string;
}

export interface SearchPlaylist {
	uuid: string;
	title: string;
	numberOfTracks: number;
	numberOfVideos: number;
	creator: SearchCreator;
	description: string;
	duration: number;
	lastUpdated: string;
	created: string;
	type: string;
	publicPlaylist: boolean;
	url: string;
	image: string;
	popularity: number;
	squareImage: string;
	customImageUrl?: string;
	promotedArtists: SearchArtist[];
	lastItemAddedAt: string;
}

export interface SearchPage<T> {
	items: T[];
	limit: number;
	offset: number;
	totalNumberOfItems: number;
}

export interface SearchItems {
	artists: SearchPage<SearchArtist>;
	albums: SearchPage<SearchAlbum>;
	tracks: SearchPage<SearchTrack>;
	playlists: SearchPage<SearchPlaylist>;

	videos: SearchPage<unknown>;
	genres: SearchPage<unknown>;
}

export interface SearchOptions {
	limit?: number;
	offset?: number;
}

// Helpers
function buildPath(
	param: string,
	query: string,
	{ limit = 10, offset = 0 }: SearchOptions,
): string {
	const qs = new URLSearchParams({
		[param]: query,
		limit: String(limit),
		offset: String(offset),
	});
	return `/search/?${qs}`;
}

// Public API
export function searchTracks(
	query: string,
	opts: SearchOptions = {},
	signal?: AbortSignal,
): Promise<SearchResponse<SearchPage<SearchTrack>>> {
	return apiGet(buildPath("s", query, opts), signal);
}

export function searchAlbums(
	query: string,
	opts: SearchOptions = {},
	signal?: AbortSignal,
): Promise<SearchResponse<SearchItems>> {
	return apiGet(buildPath("al", query, opts), signal);
}

export function searchArtists(
	query: string,
	opts: SearchOptions = {},
	signal?: AbortSignal,
): Promise<SearchResponse<SearchItems>> {
	return apiGet(buildPath("a", query, opts), signal);
}

export function searchPlaylists(
	query: string,
	opts: SearchOptions = {},
	signal?: AbortSignal,
): Promise<SearchResponse<SearchItems>> {
	return apiGet(buildPath("p", query, opts), signal);
}
