import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { ARTWORK_SIZES, artworkUrl } from "@/api/images";
import { useSearchAlbums } from "@/hooks/use-search";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

type AlbumsProps = {
	query: string;
};

export function Albums({ query }: AlbumsProps) {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSearchAlbums(query);

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
			{data.items.map((album) => (
				<Pressable
					key={album.id}
					className="w-[48%] flex flex-col items-start gap-3 p-2 bg-orange-950/50 rounded-sm overflow-visible"
					onPress={() => router.push({ pathname: "/album/[id]", params: { id: String(album.id), title: album.title, image: album.cover } })}
				>
					<View className="flex rounded-md overflow-visible relative">
						<Image
							source={{ uri: artworkUrl(album.cover, ARTWORK_SIZES.medium) }}
							className="w-full aspect-square rounded-md"
							resizeMode="contain"
						/>
					</View>
					<View className="min-w-0 w-full">
						<Text className="text-xs text-foreground" numberOfLines={1}>{album.title}</Text>
						<Text className="text-[10px] text-muted" numberOfLines={1}>{album.artists.map((artist) => artist.name).join(", ")}</Text>
						<Text className="text-[10px] text-muted">{album.numberOfTracks} tracks</Text>
					</View>
				</Pressable>
			))}
			<View ref={sentinelRef} className="h-1" />
		</View>
	);
}
