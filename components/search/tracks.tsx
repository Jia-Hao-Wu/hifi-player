import { View } from "react-native";
import { useSearchTracks } from "@/hooks/use-search";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Track } from "@/components/player-ui/track";

type TracksProps = {
	query: string;
};

export function Tracks({ query }: TracksProps) {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSearchTracks(query);

	const sentinelRef = useInfiniteScroll(
		() => fetchNextPage(),
		!!hasNextPage && !isFetchingNextPage,
	);

	if (isLoading || !data) {
		return (
			<View className="flex items-center justify-center py-12">
				<View className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
			</View>
		);
	}

	return (
		<View className="flex flex-col gap-2">
			{data.items.map((track) => (
				<Track showImage key={track.id} track={track} />
			))}
			<View ref={sentinelRef} className="h-1" />
		</View>
	);
}
