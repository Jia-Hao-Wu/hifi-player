import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ARTWORK_SIZES, artworkUrl } from "@/api/images";
import { usePlayer } from "@/contexts/player-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { TrackMeta } from "@/api/metadata";
import { Track } from "./player-ui/track";

type TrackListPageProps = {
	title: string;
	id: string;
	subtitle?: string;
	image: string | undefined;
	tracks: { item: TrackMeta }[];
};

export function TrackListPage({
	title,
	id,
	subtitle,
	image,
	tracks,
}: TrackListPageProps) {
	const router = useRouter();
	const { currentTrack, isPlaying, enQueue, replaceQueue, pause, play, currentListId } =
		usePlayer();

	return (
		<ScrollView className="flex flex-1 flex-col bg-background">
			<View className="sticky top-0 z-10 flex-row justify-between items-center gap-3 p-2 bg-background/80 backdrop-blur">
				<Pressable
					onPress={() => router.back()}
					className="flex items-center justify-center"
				>
					<IconSymbol name="chevron.left" size={30} color="var(--color-foreground)" />
				</Pressable>
			</View>

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
				<View className="mt-5">
					<TouchableOpacity
						onPress={() =>
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
								id
							)
						}
						className="h-9 w-9 items-center justify-center rounded-full bg-foreground"
					>
						<IconSymbol
							name={isPlaying && id === currentListId ? "pause.fill" : "play.fill"}
							size={20}
							color="var(--color-background)"
						/>
					</TouchableOpacity>
				</View>
			</View>

			<View className="flex flex-col">
				{tracks.map(({ item: track }, index) => (
					<Track key={track.id} track={track} index={index} />
				))}
			</View>
		</ScrollView>
	);
}
