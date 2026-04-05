import { useState } from "react";
import { FlatList, Image, Pressable, Text, TouchableOpacity, View, Modal } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useFavorites } from "@/contexts/favorites-storage";
import { usePlayer } from "@/contexts/player-context";
import { usePlaylistStorage, type LocalPlaylist } from "@/contexts/playlist-storage";
import { useScrubber } from "@/contexts/scrubber-context";
import { PausePlayButton } from "../pause-play-button";
import { ProgressBar } from "./progress-bar";
import { formatTime } from "@/utils";

export function PlayerModal({
	visible,
	onClose,
}: {
	visible: boolean;
	onClose: () => void;
}) {
	const {
		currentTrack,
		duration,
		next,
		previous,
		currentIndex,
		length,
		shuffled,
		toggleShuffle,
		looping,
		toggleLoop,
	} = usePlayer();
	const { displayPosition } = useScrubber();
	const { isFavorite, toggleFavorite } = useFavorites();
	const { playlists, addTrack } = usePlaylistStorage();
	const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);

	if (!currentTrack) return null;

	const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<Pressable
				onPress={onClose}
				className="flex-1 items-center justify-end bg-black/50 pb-5"
			>
				<Pressable
					onPress={(e) => e.stopPropagation()}
					className="w-[90%] rounded-2xl bg-player-surface mt-auto p-6"
				>
					<View className="items-center gap-4">
						<Image
							source={{ uri: currentTrack.artwork }}
							className="h-48 w-48 rounded-xl"
						/>
						<View className="items-center gap-1">
							<Text className="text-lg font-semibold text-foreground">
								{currentTrack.title}
							</Text>
							<Text className="text-sm text-muted">
								{currentTrack.artist.name}
							</Text>
						</View>

						<View className="flex-row items-center gap-6">
							<TouchableOpacity
								hitSlop={hitSlop}
								onPress={() =>
									toggleFavorite({
										id: currentTrack.id,
										type: "track",
										title: currentTrack.title,
										image: currentTrack.cover,
										subtitle: currentTrack.artist.name,
										tidalId: currentTrack.tidalId,
										duration: currentTrack.duration,
										artist: currentTrack.artist,
										album: currentTrack.album,
									})
								}
							>
								<IconSymbol
									name={isFavorite(currentTrack.id) ? "heart.fill" : "heart"}
									size={24}
									className={isFavorite(currentTrack.id) ? "text-red-500" : "text-muted"}
								/>
							</TouchableOpacity>

							<TouchableOpacity
								hitSlop={hitSlop}
								onPress={() => setShowPlaylistPicker(true)}
							>
								<IconSymbol
									name="plus"
									size={24}
									className="text-muted"
								/>
							</TouchableOpacity>
						</View>

						<PlaylistPickerModal
							visible={showPlaylistPicker}
							onClose={() => setShowPlaylistPicker(false)}
							onSelect={(playlistId) => {
								addTrack(playlistId, currentTrack);
								setShowPlaylistPicker(false);
							}}
							playlists={playlists}
						/>

						<Text className="text-xs text-muted">
							{`${formatTime(displayPosition)} / ${formatTime(duration)}`}
						</Text>

						<View className="w-full">
							<ProgressBar />
						</View>

						<View className="flex-row items-center gap-8">
							<TouchableOpacity
								onPress={toggleShuffle}
								hitSlop={hitSlop}
							>
								<IconSymbol
									name="shuffle"
									size={22}
									className={shuffled ? "text-foreground" : "text-foreground opacity-30"}
								/>
							</TouchableOpacity>

							<TouchableOpacity
								disabled={!shuffled && currentIndex === 0}
								onPress={previous}
								hitSlop={hitSlop}
							>
								<IconSymbol
									name="backward.fill"
									size={28}
									className={`text-foreground ${!shuffled && currentIndex === 0 ? "opacity-30" : ""}`}
								/>
							</TouchableOpacity>

							<PausePlayButton />

							<TouchableOpacity
								disabled={!shuffled && currentIndex === length - 1}
								onPress={next}
								hitSlop={hitSlop}
							>
								<IconSymbol
									name="forward.fill"
									size={28}
									className={`text-foreground ${!shuffled && currentIndex === length - 1 ? "opacity-30" : ""}`}
								/>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={toggleLoop}
								hitSlop={hitSlop}
							>
								<IconSymbol
									name="repeat"
									size={22}
									className={looping ? "text-foreground" : "text-foreground opacity-30"}
								/>
							</TouchableOpacity>
						</View>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

function PlaylistPickerModal({
	visible,
	onClose,
	onSelect,
	playlists,
}: {
	visible: boolean;
	onClose: () => void;
	onSelect: (playlistId: string) => void;
	playlists: LocalPlaylist[];
}) {
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<Pressable onPress={onClose} className="flex-1 items-center justify-center bg-black/50">
				<Pressable
					onPress={(e) => e.stopPropagation()}
					className="w-full max-h-[60%] rounded-t-2xl bg-player-surface mt-auto p-3"
				>
					<Text className="text-base font-semibold text-foreground mb-3">Add to playlist</Text>
					{playlists.length === 0 ? (
						<Text className="text-sm text-muted py-4 text-center">No playlists yet</Text>
					) : (
						<FlatList
							data={playlists}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<TouchableOpacity
									className="flex-row items-center gap-3 py-3"
									onPress={() => onSelect(item.id)}
								>
									<IconSymbol name="music.note.list" size={20} className="text-muted" />
									<View className="flex-1 min-w-0">
										<Text className="text-sm text-foreground" numberOfLines={1}>{item.name}</Text>
										<Text className="text-xs text-muted">{item.tracks.length} tracks</Text>
									</View>
								</TouchableOpacity>
							)}
						/>
					)}
				</Pressable>
			</Pressable>
		</Modal>
	);
}
