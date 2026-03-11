import { useInfiniteQuery } from "@tanstack/react-query";
import {
	searchTracks,
	searchAlbums,
	searchArtists,
	searchPlaylists,
	type SearchOptions,
} from "@/api";

const PAGE_SIZE = 10;

export function useSearchTracks(query: string, opts: SearchOptions = {}) {
	return useInfiniteQuery({
		queryKey: ["search", "tracks", query, opts],
		queryFn: ({ signal, pageParam = 0 }) =>
			searchTracks(query, { ...opts, limit: PAGE_SIZE, offset: pageParam }, signal),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => {
			const page = lastPage.data;
			const next = page.offset + page.limit;
			return next < page.totalNumberOfItems ? next : undefined;
		},
		select: (data) => ({
			items: data.pages.flatMap((p) => p.data.items),
			hasMore: data.pages[data.pages.length - 1].data.offset + data.pages[data.pages.length - 1].data.limit < data.pages[data.pages.length - 1].data.totalNumberOfItems,
		}),
		enabled: query.length > 0,
	});
}

export function useSearchAlbums(query: string, opts: SearchOptions = {}) {
	return useInfiniteQuery({
		queryKey: ["search", "albums", query, opts],
		queryFn: ({ signal, pageParam = 0 }) =>
			searchAlbums(query, { ...opts, limit: PAGE_SIZE, offset: pageParam }, signal),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => {
			const page = lastPage.data.albums;
			const next = page.offset + page.limit;
			return next < page.totalNumberOfItems ? next : undefined;
		},
		select: (data) => ({
			items: data.pages.flatMap((p) => p.data.albums.items),
			hasMore: (() => {
				const page = data.pages[data.pages.length - 1].data.albums;
				return page.offset + page.limit < page.totalNumberOfItems;
			})(),
		}),
		enabled: query.length > 0,
	});
}

export function useSearchArtists(query: string, opts: SearchOptions = {}) {
	return useInfiniteQuery({
		queryKey: ["search", "artists", query, opts],
		queryFn: ({ signal, pageParam = 0 }) =>
			searchArtists(query, { ...opts, limit: PAGE_SIZE, offset: pageParam }, signal),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => {
			const page = lastPage.data.artists;
			const next = page.offset + page.limit;
			return next < page.totalNumberOfItems ? next : undefined;
		},
		select: (data) => ({
			items: data.pages.flatMap((p) => p.data.artists.items),
			hasMore: (() => {
				const page = data.pages[data.pages.length - 1].data.artists;
				return page.offset + page.limit < page.totalNumberOfItems;
			})(),
		}),
		enabled: query.length > 0,
	});
}

export function useSearchPlaylists(query: string, opts: SearchOptions = {}) {
	return useInfiniteQuery({
		queryKey: ["search", "playlists", query, opts],
		queryFn: ({ signal, pageParam = 0 }) =>
			searchPlaylists(query, { ...opts, limit: PAGE_SIZE, offset: pageParam }, signal),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => {
			const page = lastPage.data.playlists;
			const next = page.offset + page.limit;
			return next < page.totalNumberOfItems ? next : undefined;
		},
		select: (data) => ({
			items: data.pages.flatMap((p) => p.data.playlists.items),
			hasMore: (() => {
				const page = data.pages[data.pages.length - 1].data.playlists;
				return page.offset + page.limit < page.totalNumberOfItems;
			})(),
		}),
		enabled: query.length > 0,
	});
}
