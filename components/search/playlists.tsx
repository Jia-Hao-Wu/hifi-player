import { useSearchPlaylists } from "@/hooks/use-search";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

type PlaylistsProps = {
	query: string;
};

export function Playlists({ query }: PlaylistsProps) {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSearchPlaylists(query);

	const sentinelRef = useInfiniteScroll(
		() => fetchNextPage(),
		!!hasNextPage && !isFetchingNextPage,
	);

	if (isLoading || !data) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex flex-col gap-2">
			{data.items.map((playlist) => (
				<div key={playlist.uuid} className="flex items-center gap-3 py-1">
					<div className="flex-1 min-w-0">
						<div className="text-sm text-foreground truncate">{playlist.title}</div>
						<div className="text-xs text-muted truncate">{playlist.numberOfTracks} tracks</div>
					</div>
				</div>
			))}
			<div ref={sentinelRef} className="h-1" />
			{isFetchingNextPage && <div className="text-center text-xs text-muted py-2">Loading more...</div>}
		</div>
	);
}
