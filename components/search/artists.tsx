import { useEffect } from "react";
import type { MutableRefObject } from "react";
import { View } from "react-native";
import { useSearchArtists } from "@/hooks/use-search";
import { ArtistCard } from "@/components/artist-card";

type ArtistsProps = {
	query: string;
	onEndReachedRef?: MutableRefObject<(() => void) | undefined>;
};

export function Artists({ query, onEndReachedRef }: ArtistsProps) {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSearchArtists(query);

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
			{data.items.map((artist, index) => (
				<ArtistCard key={`${artist.id}-${index}`} artist={artist} variant="row" />
			))}
		</View>
	);
}
