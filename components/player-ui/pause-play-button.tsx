import { TouchableOpacity, ActivityIndicator } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";
import { usePlayer } from "@/contexts/player-context";

export function PausePlayButton({
	onPress,
  isPlaying
}: {
	onPress?: (play: () => void, pause: () => void) => void;
  isPlaying?: boolean;
}) {
	const { isLoading, play, pause, isPlaying: playerIsPlaying } = usePlayer();

  isPlaying = isPlaying ?? playerIsPlaying;

	return (
		<TouchableOpacity
			onPress={() => {
				if (onPress) return onPress(play, pause);

				if (isPlaying) pause();
				else play();
			}}
			disabled={isLoading}
			className="h-9 w-9 items-center justify-center rounded-full bg-background"
		>
			{isLoading ? (
				<ActivityIndicator size="small" color="var(--color-background)" />
			) : (
				<IconSymbol
					name={isPlaying ? "pause.fill" : "play.fill"}
					size={20}
					color="var(--color-foreground)"
				/>
			)}
		</TouchableOpacity>
	);
}
