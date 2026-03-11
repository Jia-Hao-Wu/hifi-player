import { useSearchArtists } from "@/hooks/use-search";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

type ArtistsProps = {
	query: string;
};

export function Artists({ query }: ArtistsProps) {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSearchArtists(query);

	const sentinelRef = useInfiniteScroll(
		() => fetchNextPage(),
		!!hasNextPage && !isFetchingNextPage,
	);

	if (isLoading || !data) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex flex-col gap-2">
			{data.items.map((artist) => (
				<div key={artist.id} className="flex items-center gap-3 py-1">
					<div className="flex-1 min-w-0">
						<div className="text-sm text-foreground truncate">{artist.name}</div>
					</div>
				</div>
			))}
			<div ref={sentinelRef} className="h-1" />
			{isFetchingNextPage && <div className="text-center text-xs text-muted py-2">Loading more...</div>}
		</div>
	);
}
