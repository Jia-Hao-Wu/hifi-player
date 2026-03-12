import { ARTWORK_SIZES, artworkUrl } from "@/api/images";
import { usePlayer } from "@/contexts/player-context";
import { useSearchTracks } from "@/hooks/use-search";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getTrackStream } from "@/api/track";

type TracksProps = {
	query: string;
};

export function Tracks({ query }: TracksProps) {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSearchTracks(query);
	const { currentTrack, isPlaying, enQueue } = usePlayer();

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
			{data.items.map((track) => (
				<div
					key={track.id}
					className="group flex items-center gap-3 py-1 px-2 hover:bg-white/10 rounded-sm overflow-visible cursor-pointer"
					onClick={async () => {
						enQueue({
							id: track.id,
							title: track.title,
							artist: track.artist.name,
							album: track.album?.title,
							artwork: artworkUrl(track.album.cover, ARTWORK_SIZES.thumbnail),
							uri: await getTrackStream(track.id),
							tidalId: track.id,
							duration: track.duration
						});
					}}
				>
					<div className="flex items-center flex-1 overflow-visible">
						<span className="flex rounded-md w-12 h-12 overflow-visible mr-5 relative">
							<img
								className="rounded-md transition-transform duration-200 group-hover:scale-110 group-hover:z-10"
								src={artworkUrl(track.album.cover, ARTWORK_SIZES.thumbnail)}
							/>
							<div className="bg-transparent group-hover:bg-black/30 transition-colors z-20 absolute h-full w-full flex items-center justify-center">
								<IconSymbol
									className="m-auto"
									name={currentTrack?.id === track.id && isPlaying ? "pause.fill" : "play.fill"}
									color="var(--color-foreground)"
								/>
							</div>
						</span>
						<div className="min-w-0">
							<div className="text-sm text-foreground truncate">{track.title}</div>
							<div className="text-xs text-muted truncate">{track.artist.name}</div>
						</div>
					</div>
					<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
						<div className="text-xs text-muted">
							{Math.floor(track.duration / 60)}:
							{(track.duration % 60).toString().padStart(2, "0")}
						</div>
					</div>
				</div>
			))}
			<div ref={sentinelRef} className="h-1" />
			{isFetchingNextPage && <div className="text-center text-xs text-muted py-2">Loading more...</div>}
		</div>
	);
}
