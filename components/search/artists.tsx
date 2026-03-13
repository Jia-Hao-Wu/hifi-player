import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { ARTWORK_SIZES, artworkUrl } from "@/api/images";
import { useSearchArtists } from "@/hooks/use-search";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

type ArtistsProps = {
	query: string;
};

export function Artists({ query }: ArtistsProps) {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSearchArtists(query);

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
		<View className="flex flex-col gap-2">
			{data.items.map((artist) => (
				<Pressable
					key={artist.id}
					className="group flex-row items-center gap-3 py-3 px-5 hover:bg-white/10 rounded-sm overflow-visible"
					onPress={() => router.push(`/artist/${artist.id}`)}
				>
					<View className="flex-row items-center flex-1 overflow-visible">
						<View className="flex rounded-full w-12 h-12 overflow-visible mr-5 relative">
							<Image
								className="rounded-full w-12 h-12"
								source={{ uri: artworkUrl(artist.picture, ARTWORK_SIZES.medium) }}
							/>
						</View>
						<View className="min-w-0">
							<Text className="text-sm text-foreground" numberOfLines={1}>{artist.name}</Text>
						</View>
					</View>
				</Pressable>
			))}
			<View ref={sentinelRef} className="h-1" />
		</View>
	);
}
