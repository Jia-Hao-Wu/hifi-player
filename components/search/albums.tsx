import { ARTWORK_SIZES, artworkUrl } from "@/api/images";
import { useSearchAlbums } from "@/hooks/use-search";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

type AlbumsProps = {
	query: string;
};

export function Albums({ query }: AlbumsProps) {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSearchAlbums(query);

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
		<div className="grid grid-cols-2 gap-2 p-2">
			{data.items.map((album) => (
				<div
					key={album.id}
					className="group flex flex-col items-start gap-3 p-2 bg-orange-950/50 rounded-sm overflow-visible cursor-pointer"
				>
					<div className="flex rounded-md overflow-visible relative">
						<img
							src={artworkUrl(album.cover, ARTWORK_SIZES.medium)}
							className="m-auto h-full rounded-md object-contain transition-transform duration-200 group-hover:scale-110 group-hover:z-10"
						/>
					</div>
					<div className="min-w-0 w-full ">
						<div className="text-xs text-foreground truncate">{album.title}</div>
						<div className="text-[0.5rem] text-muted truncate">{album.artists.map((artist) => artist.name).join(", ")}</div>
						<div className="text-[0.6rem] text-muted truncate">{album.numberOfTracks} tracks</div>
					</div>
				</div>
			))}
			<div ref={sentinelRef} className="h-1" />
			{isFetchingNextPage && <div className="text-center text-xs text-muted py-2">Loading more...</div>}
		</div>
	);
}
