import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { ARTWORK_SIZES, artworkUrl } from "@/api/images";
import { useSearchPlaylists } from "@/hooks/use-search";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

type PlaylistsProps = {
	query: string;
};

export function Playlists({ query }: PlaylistsProps) {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSearchPlaylists(query);

	const router = useRouter();
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
		<View className="flex-row flex-wrap gap-2 p-2">
			{data.items.map((playlist) => (
				<Pressable
					key={playlist.uuid}
					className="w-[48%] flex flex-col items-start gap-3 p-2 bg-gray-800/50 rounded-sm overflow-visible"
					onPress={() => router.push({ pathname: "/playlist/[id]", params: { id: playlist.uuid, title: playlist.title, image: playlist.squareImage } })}
				>
					<View className="flex rounded-md overflow-visible relative">
						<Image
							source={{ uri: artworkUrl(playlist.squareImage, ARTWORK_SIZES.medium) }}
							className="w-full aspect-square rounded-md"
							resizeMode="contain"
						/>
					</View>
					<View className="min-w-0 w-full">
						<Text className="text-xs text-foreground" numberOfLines={1}>{playlist.title}</Text>
						<Text className="text-[10px] text-muted" numberOfLines={1}>{playlist.promotedArtists.map((artist) => artist.name).join(", ")}</Text>
						<Text className="text-[10px] text-muted">{playlist.numberOfTracks} tracks</Text>
					</View>
				</Pressable>
			))}
			<View ref={sentinelRef} className="h-1" />
		</View>
	);
}
