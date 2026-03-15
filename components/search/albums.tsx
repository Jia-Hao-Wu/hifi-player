import { useEffect } from "react";
import type { MutableRefObject } from "react";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useSearchAlbums } from "@/hooks/use-search";
import { MediaCard } from "@/components/media-card";

type AlbumsProps = {
	query: string;
	onEndReachedRef?: MutableRefObject<(() => void) | undefined>;
};

export function Albums({ query, onEndReachedRef }: AlbumsProps) {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSearchAlbums(query);

	const router = useRouter();

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
		<View className="grid grid-cols-2 gap-4 p-4">
			{data.items.map((album, index) => (
				<MediaCard
					key={`${album.id}-${index}`}
					className="gap-3 p-4 bg-accent-2 rounded-lg"
					image={album.cover}
					title={album.title}
					onPress={() => router.push({ pathname: "/album/[id]", params: { id: String(album.id), title: album.title, image: album.cover } })}
				>
					<Text className="text-[10px] text-muted" numberOfLines={1}>{album.artists.map((artist) => artist.name).join(", ")}</Text>
					<Text className="text-[10px] text-muted">{album.numberOfTracks} tracks</Text>
				</MediaCard>
			))}
		</View>
	);
}
