import { ARTWORK_SIZES, artworkUrl } from "@/api/images";
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
		return (
			<div className="flex items-center justify-center py-12">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{data.items.map((artist) => (
				<div
					key={artist.id}
					className="group flex items-center gap-3 py-1 px-2 hover:bg-white/10 rounded-sm overflow-visible cursor-pointer"
				>
					<div className="flex items-center flex-1 overflow-visible">
						<span className="flex rounded-full w-12 h-12 overflow-visible mr-5 relative">
							<img
								className="rounded-full transition-transform duration-200 group-hover:scale-110 group-hover:z-10"
								src={artworkUrl(artist.picture, ARTWORK_SIZES.medium)}
							/>
						</span>
						<div className="min-w-0">
							<div className="text-sm text-foreground truncate">{artist.name}</div>
						</div>
					</div>
				</div>
			))}
			<div ref={sentinelRef} className="h-1" />
			{isFetchingNextPage && <div className="text-center text-xs text-muted py-2">Loading more...</div>}
		</div>
	);
}
