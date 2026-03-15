import { useEffect } from "react";
import type { MutableRefObject } from "react";
import { View } from "react-native";
import { useSearchTracks } from "@/hooks/use-search";
import { Track } from "@/components/player-ui/track";

type TracksProps = {
	query: string;
	onEndReachedRef?: MutableRefObject<(() => void) | undefined>;
};

export function Tracks({ query, onEndReachedRef }: TracksProps) {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSearchTracks(query);

	useEffect(() => {
		if (!onEndReachedRef) return;
		onEndReachedRef.current =
			hasNextPage && !isFetchingNextPage ? () => fetchNextPage() : undefined;
	}, [onEndReachedRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (isLoading || !data) {
		return (
			<View className="flex items-center justify-center py-12">
				<View className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
			</View>
		);
	}

	return (
		<View className="flex flex-col gap-2">
			{data.items.map((track, index) => (
				<Track showImage key={`${track.id}-${index}`} track={track} />
			))}
		</View>
	);
}
