import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { ARTWORK_SIZES, artworkUrl } from "@/api/images";
import { usePlayer } from "@/contexts/player-context";
import { useFavorites } from "@/contexts/favorites-storage";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { TrackMeta } from "@/api/metadata";
import { Track } from "../player-ui/track";
import { PausePlayButton } from "../player-ui/pause-play-button";
import { BackHeader } from "../ui/back-header";

type TrackListPageProps = {
	title: string;
	id: string;
	type: "album" | "playlist";
	subtitle?: string;
	image: string | undefined;
	tracks: { item: TrackMeta }[];
};

export function TrackListPage({
	title,
	id,
	type,
	subtitle,
	image,
	tracks,
}: TrackListPageProps) {
	const { isPlaying, replaceQueue, currentListId } =
		usePlayer();
	const { isFavorite, toggleFavorite } = useFavorites();
	const liked = isFavorite(id);

	return (
		<ScrollView className="flex flex-1 flex-col bg-background">
			<BackHeader />

			<View className="flex flex-col items-center px-4 pb-4">
				{image && (
					<Image
						source={{ uri: artworkUrl(image, ARTWORK_SIZES.large) }}
						className="w-48 h-48 rounded-md"
						resizeMode="contain"
					/>
				)}
				<View className="mt-3 items-center">
					<Text className="text-base text-foreground font-medium">{title}</Text>
					{subtitle && <Text className="text-xs text-muted">{subtitle}</Text>}
				</View>
				<View className="mt-5 flex-row items-center gap-4">
					<PausePlayButton
						isPlaying={isPlaying && id === currentListId}
						onPress={() => {
							replaceQueue(
								tracks.map(({ item: track }) => ({
									id: track.id,
									title: track.title,
									artist: {
										id: track.artist.id,
										name: track.artist.name,
									},
									album: track.album?.title,
									artwork: artworkUrl(track.album?.cover, ARTWORK_SIZES.thumbnail),
									tidalId: track.id,
									duration: track.duration,
								})),
								id,
							);
						}}
					/>
					<Pressable
						onPress={() => toggleFavorite({ id, type, title, image, subtitle })}
						hitSlop={8}
					>
						<IconSymbol
							name={liked ? "heart.fill" : "heart"}
							size={15}
							className="text-red-500"
						/>
					</Pressable>
				</View>
			</View>

			<View className="flex flex-col">
				{tracks.map(({ item: track }, index) => (
					<Track key={`${track.id}-${index}`} track={track} index={index} />
				))}
			</View>
		</ScrollView>
	);
}
