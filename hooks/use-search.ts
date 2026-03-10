import { useQuery } from "@tanstack/react-query";
import {
	searchTracks,
	searchAlbums,
	searchArtists,
	searchPlaylists,
	type SearchOptions,
} from "@/api";

export function useSearchTracks(query: string, opts: SearchOptions = {}) {
	return useQuery({
		queryKey: ["search", "tracks", query, opts],
		queryFn: ({ signal }) => searchTracks(query, opts, signal),
		enabled: query.length > 0,
	});
}

export function useSearchAlbums(query: string, opts: SearchOptions = {}) {
	return useQuery({
		queryKey: ["search", "albums", query, opts],
		queryFn: ({ signal }) => searchAlbums(query, opts, signal),
		enabled: query.length > 0,
	});
}

export function useSearchArtists(query: string, opts: SearchOptions = {}) {
	return useQuery({
		queryKey: ["search", "artists", query, opts],
		queryFn: ({ signal }) => searchArtists(query, opts, signal),
		enabled: query.length > 0,
	});
}

export function useSearchPlaylists(query: string, opts: SearchOptions = {}) {
	return useQuery({
		queryKey: ["search", "playlists", query, opts],
		queryFn: ({ signal }) => searchPlaylists(query, opts, signal),
		enabled: query.length > 0,
	});
}
