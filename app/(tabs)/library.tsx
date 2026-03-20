import { useRef, useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
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

const DELETE_THRESHOLD = -80;

export default function LibraryScreen() {
	const { playlists, createPlaylist, deletePlaylist } = usePlaylistStorage();
	const { favorites, toggleFavorite } = useFavorites();
	const router = useRouter();
	const [isCreating, setIsCreating] = useState(false);
	const [newName, setNewName] = useState("");
	const inputRef = useRef<TextInput>(null);

	const handleCreate = () => {
		const name = newName.trim();
		if (!name) return;
		createPlaylist(name);
		setNewName("");
		setIsCreating(false);
	};

	const favPlaylists = favorites.filter((f) => f.type === "playlist");
	const favAlbums = favorites.filter((f) => f.type === "album");

	return (
		<View className="flex-1 bg-background">
			<View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
				<Text className="text-lg font-bold text-foreground">Library</Text>
				<Pressable
					onPress={() => {
						setIsCreating(true);
						setTimeout(() => inputRef.current?.focus(), 100);
					}}
					hitSlop={8}
				>
					<IconSymbol name="plus" size={24} className="text-foreground" />
				</Pressable>
			</View>

			{isCreating && (
				<View className="px-5 py-2 flex-row items-center gap-2">
					<TextInput
						ref={inputRef}
						className="flex-1 bg-player-surface rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted"
						placeholder="Playlist name"
						value={newName}
						onChangeText={setNewName}
						onSubmitEditing={handleCreate}
						autoFocus
					/>
					<Pressable onPress={handleCreate} className="px-3 py-2 rounded-md bg-player-surface">
						<Text className="text-sm text-foreground">Create</Text>
					</Pressable>
					<Pressable
						onPress={() => {
							setIsCreating(false);
							setNewName("");
						}}
					>
						<IconSymbol name="xmark" size={18} className="text-muted" />
					</Pressable>
				</View>
			)}

			<Tabs
				tabs={[
					{
						label: "My Playlists",
						content: (
							<View>
								{playlists.length === 0 ? (
									<View className="items-center justify-center py-20">
										<Text className="text-sm text-muted">No playlists yet</Text>
									</View>
								) : (
									playlists.map((playlist) => (
										<SwipeablePlaylistRow
											key={playlist.id}
											playlist={playlist}
											onPress={() => router.push(`/local-playlist/${playlist.id}`)}
											onDelete={() => deletePlaylist(playlist.id)}
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
								{favPlaylists.length === 0 ? (
									<View className="items-center justify-center py-20">
										<Text className="text-sm text-muted">No liked playlists</Text>
									</View>
								) : (
									favPlaylists.map((fav) => (
										<FavoriteRow
											key={fav.id}
											favorite={fav}
											onPress={() => router.push(`/playlist/${fav.id}?title=${encodeURIComponent(fav.title)}&image=${encodeURIComponent(fav.image ?? "")}`)}
											onRemove={() => toggleFavorite(fav)}
										/>
									))
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
