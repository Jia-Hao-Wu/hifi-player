import { Image, Pressable, Text, TouchableOpacity, View, Modal } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePlayer } from "@/contexts/player-context";
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
				className="flex-1 items-center justify-end bg-black/50 pb-24"
			>
				<Pressable
					onPress={(e) => e.stopPropagation()}
					className="w-[90%] rounded-2xl bg-player-surface p-6"
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
