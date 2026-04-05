import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { MarqueeText } from "@/components/ui/marquee-text";
import { useFavorites } from "@/contexts/favorites-storage";
import { usePlayer } from "@/contexts/player-context";
import { ScrubberProvider, useScrubber } from "@/contexts/scrubber-context";
import { formatTime } from "@/utils";
import { useRouter } from "expo-router";
import { PausePlayButton } from "../pause-play-button";
import { PlayerModal } from "./modal";
import { ProgressBar } from "./progress-bar";

function PlayerControlsInner() {
	const { currentTrack, duration } = usePlayer();
	const { displayPosition } = useScrubber();
	const { isFavorite, toggleFavorite } = useFavorites();
	const router = useRouter();
	const [showModal, setShowModal] = useState(false);

	if (!currentTrack) return null;

	return (
		<View className="border-t border-player-border bg-player-surface">
			<ProgressBar />

			<Pressable
				onPress={() => setShowModal(true)}
				className="flex-row items-center gap-[10px] px-3 py-2"
			>
				<Image source={{ uri: currentTrack.artwork }} className="h-11 w-11 rounded-md" />
				<View className="flex-1 gap-0.5">
					<MarqueeText
						text={currentTrack.title}
						className="text-sm font-semibold tracking-tight text-foreground"
					/>
					<View className="flex flex-row">
						<Pressable onPress={() => router.push(`/artist/${currentTrack.artist.id}`)} className="pr-3">
							<Text className="text-xs text-muted">{currentTrack.artist.name}</Text>
						</Pressable>
					</View>
				</View>

				<Text className="text-[11px] text-muted">
					{`${formatTime(displayPosition)} / ${formatTime(duration)}`}
				</Text>

				<Pressable
					hitSlop={8}
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
						size={18}
						className={isFavorite(currentTrack.id) ? "text-red-500" : "text-muted"}
					/>
				</Pressable>

				<PausePlayButton />
			</Pressable>

			<PlayerModal visible={showModal} onClose={() => setShowModal(false)} />
		</View>
	);
}

export function PlayerControls() {
	return (
		<ScrubberProvider>
			<PlayerControlsInner />
		</ScrubberProvider>
	);
}
