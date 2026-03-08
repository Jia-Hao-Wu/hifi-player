import React, { useCallback, useState } from "react";
import {
  type GestureResponderEvent,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { usePlayer } from "@/contexts/player-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MinMax } from "@/utils";

export function PlayerControls() {
	const {
		currentTrack,
		isPlaying,
		position,
		duration,
		play,
		pause,
		next,
		previous,
		seek,
	} = usePlayer();
	const colorScheme = useColorScheme() ?? "light";

	const { icon: iconColor, text: textColor, tint: tintColor } = Colors[colorScheme];

	const [barWidth, setBarWidth] = useState(0);
	const progress = duration > 0 ? position / duration : 0;

	const handleProgressPress = useCallback(
		(evt: GestureResponderEvent) => {
			if (duration && (duration <= 0 || !barWidth)) return;
			const { clientX } = evt.nativeEvent;
			const ratio = MinMax(0, 1, clientX / barWidth);

			console.log(clientX, barWidth, ratio, duration, ratio * duration);
			seek(ratio * duration);
		},
		[duration, seek, barWidth],
	);

	if (!currentTrack) return null;

	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	return (
		<View className="border-t border-player-border bg-player-surface">
			<TouchableOpacity
				activeOpacity={1}
				onPress={handleProgressPress}
				onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
				className="h-[3px] bg-gray-500/20"
			>
				<View
					className="h-full"
					style={{ width: `${progress * 100}%`, backgroundColor: tintColor }}
				/>
			</TouchableOpacity>

			<View className="flex-row items-center gap-[10px] px-3 py-2">
				<Image
					source={{ uri: currentTrack.artwork }}
					className="h-11 w-11 rounded-md bg-gray-300"
				/>

				<View className="flex-1 gap-0.5">
					<Text
						className="text-sm font-semibold tracking-tight text-foreground"
						numberOfLines={1}
					>
						{currentTrack.title}
					</Text>
					<Text className="text-xs text-icon" numberOfLines={1}>
						{currentTrack.artist}
					</Text>
				</View>

				<Text className="text-[11px] text-icon">{`${formatTime(position)} / ${formatTime(duration)}`}</Text>

				<View className="flex-row items-center gap-3">
					<TouchableOpacity
						onPress={previous}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
					>
						<IconSymbol name="backward.fill" size={18} color={textColor} />
					</TouchableOpacity>

					<TouchableOpacity
						onPress={isPlaying ? pause : play}
						className="h-9 w-9 items-center justify-center rounded-full bg-tint"
					>
						<IconSymbol
							name={isPlaying ? "pause.fill" : "play.fill"}
							size={20}
							color={iconColor}
						/>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={next}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
					>
						<IconSymbol name="forward.fill" size={18} color={textColor} />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}
