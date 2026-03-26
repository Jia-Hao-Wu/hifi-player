/**
 * Full-detail metadata endpoints.
 * Returns richer objects than search — used for album/artist screens
 * and for enriching queue items with duration, track number, etc.
 */

import { apiGet } from "./client";
import { StreamQuality } from "./track";

// Types

export interface ArtistMeta {
	id: string;
	name: string;
	handle?: string;
	type?: string;
	picture?: string | null;
}

export interface AlbumMeta {
	id: string;
	title: string;
	cover: string;
	vibrantColor: string;
	videoCover?: string;
	releaseDate: string;
	numberOfTracks: number;
}

export interface TrackMeta {
	id: string;
	title: string;
	duration: number;
	replayGain: number;
	allowStreaming: boolean;
	streamReady: boolean;
	payToStream: boolean;
	doublePopularity: number;
	adSupportedStreamReady: boolean;
	djReady: boolean;
	stemReady: boolean;
	streamStartDate: string;
	premiumStreamingOnly: boolean;
	trackNumber: number;
	volumeNumber: number;
	version?: string;
	popularity: number;
	copyright: string;
	bpm: number;
	key: string;
	keyScale: string;
	description?: string;
	url: string;
	isrc: string;
	editable: boolean;
	explicit: boolean;
	audioQuality: string;
	audioModes: string[];
	mediaMetadata: StreamQuality;
	upload: boolean;
	accessType: string;
	spotlighted: boolean;
	artist: ArtistMeta;
	artists: ArtistMeta[];
	album: AlbumMeta;
	dateAdded: string;
	index: number;
	itemUuid: string;
}

export interface AlbumDetail {
	data: {
		id: string;
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
		audioQuality: StreamQuality;
		audioModes: string[];
		mediaMetadata: {
			tags: StreamQuality[];
		};
		upload: boolean;
		artist: ArtistMeta;
		artists: ArtistMeta[];
		items: { item: TrackMeta }[];
	};
}

export interface ArtistTracks {
	version: string;
	tracks: TrackMeta[];
	albums: {
		items: AlbumMeta[];
	}
}

export interface ArtistDetail extends ArtistMeta {
	artist: {
		id: string;
		name: string;
		artistTypes: string[];
		url: string;
		picture: string;
		selectedAlbumCoverFallback?: string;
		popularity: number;
		artistRoles: {
			categoryId: number;
			category: string;
		};
		handle?: string;
		spotlighted: boolean;
	};
}

export interface Recommendation {
	id: string;
	title: string;
	duration: number;
	artist: ArtistMeta;
	album: AlbumMeta;
}

export interface PlaylistDetail {
	version: string;
	playlist: {
		uuid: string;
		title: string;
		numberOfTracks: number;
		numberOfVideos: number;
		creator?: string;
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
		promotedArtists: ArtistMeta[];
		lastItemAddedAt: string;
	};
	items: {
		type: string;
		item: TrackMeta;
	}[];
}

// Public API

export function getTrackMeta(id: string, signal?: AbortSignal): Promise<TrackMeta> {
	return apiGet(`/info/?${new URLSearchParams({ id })}`, signal);
}

export function getAlbumDetail(
	id: string,
	opts: { offset?: number; limit?: number } = {},
	signal?: AbortSignal,
): Promise<AlbumDetail> {
	const params: Record<string, string> = { id };
	if (opts.offset !== undefined) params.offset = String(opts.offset);
	if (opts.limit !== undefined) params.limit = String(opts.limit);
	return apiGet(`/album/?${new URLSearchParams(params)}`, signal);
}

export function getArtistDetail(
	id: string,
	opts: { offset?: number; limit?: number } = {},
	signal?: AbortSignal,
): Promise<ArtistDetail> {
	const params: Record<string, string> = { id };
	if (opts.offset !== undefined) params.offset = String(opts.offset);
	if (opts.limit !== undefined) params.limit = String(opts.limit);
	return apiGet(`/artist/?${new URLSearchParams(params)}`, signal);
}

export function getArtistTracks(
	id: string,
	opts: { offset?: number; limit?: number } = {},
	signal?: AbortSignal,
): Promise<ArtistTracks> {
	const params: Record<string, string> = { f: id };
	if (opts.offset !== undefined) params.offset = String(opts.offset);
	if (opts.limit !== undefined) params.limit = String(opts.limit);
	return apiGet(`/artist/?${new URLSearchParams(params)}`, signal);
}

export function getPlaylistDetail(
	id: string,
	opts: { offset?: number; limit?: number } = {},
	signal?: AbortSignal,
): Promise<PlaylistDetail> {
	const params: Record<string, string> = { id };
	if (opts.offset !== undefined) params.offset = String(opts.offset);
	if (opts.limit !== undefined) params.limit = String(opts.limit);
	return apiGet(`/playlist/?${new URLSearchParams(params)}`, signal);
}

export function getSimilarArtists(
	id: string,
	opts: { offset?: number; limit?: number } = {},
	signal?: AbortSignal,
): Promise<{ artists: ArtistMeta[] }> {
	const params: Record<string, string> = { id };
	if (opts.offset !== undefined) params.offset = String(opts.offset);
	if (opts.limit !== undefined) params.limit = String(opts.limit);
	return apiGet(`/artist/similar/?${new URLSearchParams(params)}`, signal);
}

export function getRecommendations(
	id: string,
	signal?: AbortSignal,
): Promise<{ items: Recommendation[] }> {
	return apiGet(`/recommendations/?${new URLSearchParams({ id })}`, signal);
}
