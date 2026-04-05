import { Image, Pressable, Text, View } from "react-native";
import { ARTWORK_SIZES, artworkUrl, getTrackStream } from "@/api";
import { usePlayer } from "@/contexts/player-context";
import { useAddToPlaylist } from "@/components/add-to-playlist-modal";
import { IconSymbol } from "../ui/icon-symbol";
import type { TrackMeta } from "@/api/metadata";
import type { Track as PlayerTrack } from "@/constants/tracks";
import { MarqueeText } from "../ui/marquee-text";

function isTrackMeta(track: PlayerTrack | TrackMeta): track is TrackMeta {
	return typeof track.album !== "string";
}

export type TrackProps = {
	track: PlayerTrack | TrackMeta;
	showImage?: boolean;
	index?: number;
	actions?: React.ReactNode;
};

export function Track({ track, showImage = false, index, actions }: TrackProps) {
	const { currentTrack, isPlaying, enQueue } = usePlayer();
	const showAddToPlaylist = useAddToPlaylist();

	const meta = isTrackMeta(track);

	const artwork = meta
		? artworkUrl(track.album?.cover, ARTWORK_SIZES.thumbnail)
		: track.artwork;

	let mainArtist = track.artist;
	let artistAlbum: string;

	if (!mainArtist && meta) {
		mainArtist = track.artists[0];
		artistAlbum = track.artists.map((a) => a.name).join(", ");
	} else {
		const albumTitle = meta ? track.album?.title : track.album;
		artistAlbum = albumTitle
			? `${albumTitle} - ${mainArtist.name}`
			: mainArtist.name;
	}

	const playerTrack: PlayerTrack = meta
		? {
				id: track.id,
				title: track.title,
				artist: mainArtist,
				album: track.album?.title ?? "",
				artwork,
				tidalId: track.id,
				cover: artwork,
				duration: track.duration,
			}
		: track;

	const isCurrentTrack = currentTrack?.id === track.id;

	return (
		<Pressable
			key={track.id}
			className={`group flex-row items-center gap-3 py-3 px-5 hover:bg-white/10 rounded-sm overflow-hidden ${isCurrentTrack ? "bg-accent" : ""}`}
			onPress={async () =>
				enQueue({
					...playerTrack,
					uri: playerTrack.uri ?? (await getTrackStream(track.id)),
				})
			}
		>
			<View className="flex flex-row gap-2 items-center flex-1 min-w-0 overflow-visible">
				{index !== undefined ? (
					<Text className="w-6 text-xs text-muted">{index + 1}</Text>
				) : null}
				{showImage && (
					<View className="flex rounded-md border-none w-12 h-12 overflow-visible mr-5 relative">
						<Image
							className={`rounded-md w-12 h-12 ${isCurrentTrack ? "scale-110 z-10" : ""}`}
							source={{ uri: artwork }}
						/>
						<View className="bg-transparent rounded-md group-hover:bg-black/30 z-20 absolute h-full w-full flex items-center justify-center">
							<IconSymbol
								className="m-auto"
								name={
									isCurrentTrack && isPlaying ? "pause.fill" : "play.fill"
								}
								color="white"
							/>
						</View>
					</View>
				)}
				<View className="flex-1 min-w-0">
					{isCurrentTrack ?  <MarqueeText text={track.title} /> : <Text className="text-sm text-foreground" numberOfLines={1}>{track.title}</Text>}
					<Text className="text-xs text-muted" numberOfLines={1}>{artistAlbum}</Text>
				</View>
			</View>
			<View className="flex-row items-center gap-2">
				<Text className="text-xs text-muted opacity-0 group-hover:opacity-100">
					{Math.floor((track?.duration || 0) / 60)}:
					{((track?.duration || 0) % 60).toString().padStart(2, "0")}
				</Text>
				{!showImage && (
					<IconSymbol
						className={`text-foreground ${
							currentTrack?.id !== track.id
								? "opacity-0 group-hover:opacity-100"
								: "m-auto"
						}`}
						name={isCurrentTrack && isPlaying ? "pause.fill" : "play.fill"}
					/>
				)}
				<Pressable
					hitSlop={8}
					onPress={() => showAddToPlaylist(playerTrack)}
				>
					<IconSymbol name="plus" size={24} className="text-muted" />
				</Pressable>
				{actions}
			</View>
		</Pressable>
	);
}
