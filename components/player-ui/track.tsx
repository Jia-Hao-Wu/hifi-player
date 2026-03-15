import { Image, Pressable, Text, View } from "react-native";
import { ARTWORK_SIZES, artworkUrl, getTrackStream } from "@/api";
import { usePlayer } from "@/contexts/player-context";
import { IconSymbol } from "../ui/icon-symbol";
import { TrackMeta } from "@/api/metadata";

export type TrackProps = {
	track: TrackMeta;
	showImage?: boolean;
	index?: number;
};

export function Track({ track, showImage = false, index }: TrackProps) {
	const { currentTrack, isPlaying, enQueue } = usePlayer();

	let artistAlbum;
	let mainArtist = track.artist;

	if (!mainArtist) {
		mainArtist = track.artists[0];
		artistAlbum = track.artists.map((a) => a.name).join(", ");
	} else {
		artistAlbum = track.album?.title
			? `${track.album.title} - ${track.artist.name}`
			: track.artist.name;
	}

	return (
		<Pressable
			key={track.id}
			className={`group flex-row items-center gap-3 py-3 px-5 hover:bg-white/10 rounded-sm overflow-hidden ${currentTrack?.id === track.id ? "bg-accent" : ""}`}
			onPress={async () =>
				enQueue({
					id: track.id,
					title: track.title,
					artist: mainArtist,
					album: track.album?.title,
					artwork: artworkUrl(track.album.cover, ARTWORK_SIZES.thumbnail),
					uri: await getTrackStream(track.id),
					tidalId: track.id,
					duration: track.duration,
				})
			}
		>
			<View className="flex-row items-center flex-1 min-w-0 overflow-visible">
				{index !== undefined ? (
					<Text className="w-6 text-xs text-muted">{index + 1}</Text>
				) : null}
				{showImage && (
					<View className="flex rounded-md border-none w-12 h-12 overflow-visible mr-5 relative">
						<Image
							className={`rounded-md w-12 h-12 ${currentTrack?.id === track.id ? "scale-110 z-10" : ""}`}
							source={{ uri: artworkUrl(track.album.cover, ARTWORK_SIZES.thumbnail) }}
						/>
						<View className="bg-transparent rounded-md group-hover:bg-black/30 transition-colors z-20 absolute h-full w-full flex items-center justify-center">
							<IconSymbol
								className="m-auto"
								name={
									currentTrack?.id === track.id && isPlaying ? "pause.fill" : "play.fill"
								}
								color="white"
							/>
						</View>
					</View>
				)}
				<View className="flex-1 min-w-0">
					<Text className="text-sm text-foreground" numberOfLines={1}>{track.title}</Text>
					<Text className="text-xs text-muted" numberOfLines={1}>{artistAlbum}</Text>
				</View>
			</View>
			<View className="flex-row items-center gap-2">
				<Text className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">
					{Math.floor(track.duration / 60)}:
					{(track.duration % 60).toString().padStart(2, "0")}
				</Text>
				{!showImage && (
					<IconSymbol
						className={
							currentTrack?.id !== track.id
								? "opacity-0 group-hover:opacity-100 transition-opacity"
								: "m-auto"
						}
						name={currentTrack?.id === track.id && isPlaying ? "pause.fill" : "play.fill"}
						color="var(--color-foreground)"
					/>
				)}
			</View>
		</Pressable>
	);
}
