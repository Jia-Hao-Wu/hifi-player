import { useEffect } from "react";
import type { MutableRefObject } from "react";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useSearchPlaylists } from "@/hooks/use-search";
import { MediaCard } from "@/components/media-card";

type PlaylistsProps = {
	query: string;
	onEndReachedRef?: MutableRefObject<(() => void) | undefined>;
};

export function Playlists({ query, onEndReachedRef }: PlaylistsProps) {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSearchPlaylists(query);

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
			{data.items.map((playlist, index) => (
				<MediaCard
					key={`${playlist.uuid}-${index}`}
					className="gap-3 p-4 bg-accent rounded-md"
					image={playlist.squareImage}
					title={playlist.title}
					onPress={() => router.push({ pathname: "/playlist/[id]", params: { id: playlist.uuid, title: playlist.title, image: playlist.squareImage } })}
				>
					<Text className="text-[10px] text-muted" numberOfLines={1}>{playlist.promotedArtists.map((artist) => artist.name).join(", ")}</Text>
					<Text className="text-[10px] text-muted">{playlist.numberOfTracks} tracks</Text>
				</MediaCard>
			))}
		</View>
	);
}
