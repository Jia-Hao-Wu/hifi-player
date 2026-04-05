import { useRef, useState } from "react";
import { Image, Modal, Pressable, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

import { ARTWORK_SIZES, artworkUrl } from "@/api";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Tabs } from "@/components/ui/tabs";
import { usePlaylistStorage, type LocalPlaylist } from "@/contexts/playlist-storage";
import { useFavorites, type Favorite } from "@/contexts/favorites-storage";
import { usePlayer } from "@/contexts/player-context";

const DELETE_THRESHOLD = -80;

export default function LibraryScreen() {
	const { playlists, createPlaylist, deletePlaylist } = usePlaylistStorage();
	const { favorites, toggleFavorite } = useFavorites();
	const { enQueue } = usePlayer();
	const router = useRouter();
	const [isCreating, setIsCreating] = useState(false);
	const [newName, setNewName] = useState("");
	const [activeTab, setActiveTab] = useState(0);
	const inputRef = useRef<TextInput>(null);

	const handleCreate = () => {
		const name = newName.trim();
		if (!name) return;
		createPlaylist(name);
		setNewName("");
		setIsCreating(false);
	};

	const favTracks = favorites.filter((f) => f.type === "track");
	const favPlaylists = favorites.filter((f) => f.type === "playlist");
	const favAlbums = favorites.filter((f) => f.type === "album");

	const allPlaylists = [
		...playlists.map((p) => ({ kind: "local" as const, id: p.id, name: p.name, data: p })),
		...favPlaylists.map((f) => ({ kind: "favorite" as const, id: f.id, name: f.title, data: f })),
	].sort((a, b) => a.name.localeCompare(b.name));

	return (
		<View className="flex-1 bg-background">
			<View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
				<Text className="text-lg font-bold text-foreground">Library</Text>
				{activeTab === 1 && (
					<Pressable
						onPress={() => {
							setIsCreating(true);
							setTimeout(() => inputRef.current?.focus(), 100);
						}}
						hitSlop={8}
					>
						<IconSymbol name="plus" size={24} className="text-foreground" />
					</Pressable>
				)}
			</View>

			<Modal
				visible={isCreating}
				transparent
				animationType="fade"
				onRequestClose={() => { setIsCreating(false); setNewName(""); }}
			>
				<Pressable
					onPress={() => { setIsCreating(false); setNewName(""); }}
					className="flex-1 items-center justify-center bg-black/50"
				>
					<Pressable
						onPress={(e) => e.stopPropagation()}
						className="w-[80%] rounded-2xl bg-player-surface p-5"
					>
						<Text className="text-base font-semibold text-foreground mb-3">New Playlist</Text>
						<TextInput
							ref={inputRef}
							className="bg-background rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted"
							placeholder="Playlist name"
							value={newName}
							onChangeText={setNewName}
							onSubmitEditing={handleCreate}
							autoFocus
						/>
						<View className="flex-row justify-end gap-3 mt-4">
							<Pressable
								onPress={() => { setIsCreating(false); setNewName(""); }}
								className="px-4 py-2 rounded-md"
							>
								<Text className="text-sm text-muted">Cancel</Text>
							</Pressable>
							<Pressable
								onPress={handleCreate}
								className="px-4 py-2 rounded-md bg-foreground"
							>
								<Text className="text-sm text-background font-medium">Create</Text>
							</Pressable>
						</View>
					</Pressable>
				</Pressable>
			</Modal>

			<Tabs
				onTabChange={setActiveTab}
				tabs={[
					{
						label: "Tracks",
						content: (
							<View>
								{favTracks.length === 0 ? (
									<View className="items-center justify-center py-20">
										<Text className="text-sm text-muted">No liked tracks</Text>
									</View>
								) : (
									favTracks.map((fav) => (
										<FavoriteRow
											key={fav.id}
											favorite={fav}
											onPress={() => enQueue({
												id: fav.id,
												tidalId: fav.tidalId ?? fav.id,
												title: fav.title,
												artist: fav.artist ?? { id: "", name: fav.subtitle ?? "Unknown Artist" },
												album: fav.album ?? "",
												cover: fav.image ?? "",
												artwork: fav.image ? artworkUrl(fav.image, ARTWORK_SIZES.medium) : "",
												duration: fav.duration,
											})}
											onRemove={() => toggleFavorite(fav)}
										/>
									))
								)}
							</View>
						),
					},
					{
						label: "Playlists",
						content: (
							<View>
								{allPlaylists.length === 0 ? (
									<View className="items-center justify-center py-20">
										<Text className="text-sm text-muted">No playlists yet</Text>
									</View>
								) : (
									allPlaylists.map((item) =>
										item.kind === "local" ? (
											<SwipeablePlaylistRow
												key={`local-${item.id}`}
												playlist={item.data}
												onPress={() => router.push(`/local-playlist/${item.id}`)}
												onDelete={() => deletePlaylist(item.id)}
											/>
										) : (
											<FavoriteRow
												key={`fav-${item.id}`}
												favorite={item.data}
												onPress={() => router.push(`/playlist/${item.id}?title=${encodeURIComponent(item.data.title)}&image=${encodeURIComponent(item.data.image ?? "")}`)}
												onRemove={() => toggleFavorite(item.data)}
											/>
										)
									)
								)}
							</View>
						),
					},
					{
						label: "Albums",
						content: (
							<View>
								{favAlbums.length === 0 ? (
									<View className="items-center justify-center py-20">
										<Text className="text-sm text-muted">No liked albums</Text>
									</View>
								) : (
									favAlbums.map((fav) => (
										<FavoriteRow
											key={fav.id}
											favorite={fav}
											onPress={() => router.push(`/album/${fav.id}`)}
											onRemove={() => toggleFavorite(fav)}
										/>
									))
								)}
							</View>
						),
					},
				]}
			/>
		</View>
	);
}

function FavoriteRow({
	favorite,
	onPress,
	onRemove,
}: {
	favorite: Favorite;
	onPress: () => void;
	onRemove: () => void;
}) {
	const translateX = useSharedValue(0);

	const gesture = Gesture.Pan()
		.activeOffsetX([-10, 10])
		.onUpdate((e) => {
			translateX.value = Math.min(0, e.translationX);
		})
		.onEnd(() => {
			if (translateX.value < DELETE_THRESHOLD) {
				translateX.value = withTiming(-300, { duration: 200 }, () => {
					runOnJS(onRemove)();
				});
			} else {
				translateX.value = withSpring(0);
			}
		});

	const rowStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	return (
		<View className="overflow-hidden">
			<View className="absolute right-0 top-0 bottom-0 w-20 bg-red-600 items-center justify-center">
				<IconSymbol name="heart.slash" size={20} color="white" />
			</View>
			<GestureDetector gesture={gesture}>
				<Animated.View style={rowStyle}>
					<Pressable
						className="flex-row items-center gap-3 px-5 py-3 bg-background"
						onPress={onPress}
					>
						<View className="h-12 w-12 rounded-md bg-player-surface overflow-hidden items-center justify-center">
							{favorite.image ? (
								<Image
									source={{ uri: artworkUrl(favorite.image, ARTWORK_SIZES.medium) }}
									className="h-12 w-12"
								/>
							) : (
								<IconSymbol name="music.note" size={20} className="text-muted" />
							)}
						</View>
						<View className="flex-1 min-w-0">
							<Text className="text-sm text-foreground" numberOfLines={1}>
								{favorite.title}
							</Text>
							{favorite.subtitle && (
								<Text className="text-xs text-muted">{favorite.subtitle}</Text>
							)}
						</View>
					</Pressable>
				</Animated.View>
			</GestureDetector>
		</View>
	);
}

function SwipeablePlaylistRow({
	playlist,
	onPress,
	onDelete,
}: {
	playlist: LocalPlaylist;
	onPress: () => void;
	onDelete: () => void;
}) {
	const translateX = useSharedValue(0);

	const gesture = Gesture.Pan()
		.activeOffsetX([-10, 10])
		.onUpdate((e) => {
			translateX.value = Math.min(0, e.translationX);
		})
		.onEnd(() => {
			if (translateX.value < DELETE_THRESHOLD) {
				translateX.value = withTiming(-300, { duration: 200 }, () => {
					runOnJS(onDelete)();
				});
			} else {
				translateX.value = withSpring(0);
			}
		});

	const rowStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	return (
		<View className="overflow-hidden">
			<View className="absolute right-0 top-0 bottom-0 w-20 bg-red-600 items-center justify-center">
				<IconSymbol name="trash" size={20} color="white" />
			</View>
			<GestureDetector gesture={gesture}>
				<Animated.View style={rowStyle}>
					<Pressable
						className="flex-row items-center gap-3 px-5 py-3 bg-background"
						onPress={onPress}
					>
						<View className="h-12 w-12 rounded-md bg-player-surface items-center justify-center">
							<IconSymbol name="music.note.list" size={24} className="text-muted" />
						</View>
						<View className="flex-1 min-w-0">
							<Text className="text-sm text-foreground" numberOfLines={1}>
								{playlist.name}
							</Text>
							<Text className="text-xs text-muted">
								{playlist.tracks.length} track{playlist.tracks.length !== 1 ? "s" : ""}
							</Text>
						</View>
					</Pressable>
				</Animated.View>
			</GestureDetector>
		</View>
	);
}
