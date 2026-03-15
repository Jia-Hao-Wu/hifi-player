import { useRef, useState } from "react";
import {
	Image,
	PanResponder,
	Pressable,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePlayer } from "@/contexts/player-context";
import { MinMax } from "@/utils";
import { useRouter } from "expo-router";
import { PausePlayButton } from "./pause-play-button";

export function PlayerControls() {
	const {
		currentTrack,
		position,
		duration,
		next,
		previous,
		seek,
		currentIndex,
		queue,
	} = usePlayer();

	const router = useRouter();
	const [barWidth, setBarWidth] = useState(0);
	const [isScrubbing, setIsScrubbing] = useState(false);
	const [scrubRatio, setScrubRatio] = useState(0);

	const barWidthRef = useRef(0);
	const durationRef = useRef(duration);
	const seekRef = useRef(seek);
	const scrubRatioRef = useRef(0);
	durationRef.current = duration;
	seekRef.current = seek;

	const progress = duration > 0 ? position / duration : 0;
	const displayProgress = isScrubbing ? scrubRatio : progress;
	const displayPosition = isScrubbing ? scrubRatio * duration : position;

	const startRatioRef = useRef(0);

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: () => true,
			onPanResponderGrant: (evt) => {
				if (!barWidthRef.current) return;
				const ratio = MinMax(0, 1, evt.nativeEvent.locationX / barWidthRef.current);
				startRatioRef.current = ratio;
				scrubRatioRef.current = ratio;
				setIsScrubbing(true);
				setScrubRatio(ratio);
			},
			onPanResponderMove: (_evt, gestureState) => {
				if (!barWidthRef.current) return;
				const ratio = MinMax(
					0,
					1,
					startRatioRef.current + gestureState.dx / barWidthRef.current,
				);
				scrubRatioRef.current = ratio;
				setScrubRatio(ratio);
			},
			onPanResponderRelease: (_evt, gestureState) => {
				if (!barWidthRef.current || !durationRef.current) return;
				const ratio = MinMax(
					0,
					1,
					startRatioRef.current + gestureState.dx / barWidthRef.current,
				);
				seekRef.current(ratio * durationRef.current);
				setScrubRatio(ratio);
				setIsScrubbing(false);
			},
			onPanResponderTerminate: () => {
				if (durationRef.current) {
					seekRef.current(scrubRatioRef.current * durationRef.current);
				}
				setIsScrubbing(false);
			},
		}),
	).current;

	if (!currentTrack) return null;

	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	const dotSize = isScrubbing ? 14 : 10;

	return (
		<View className="border-t border-player-border bg-player-surface">
			<View
				onLayout={(e) => {
					const w = e.nativeEvent.layout.width;
					setBarWidth(w);
					barWidthRef.current = w;
				}}
				{...panResponder.panHandlers}
			>
				<View className="h-[3px] overflow-hidden rounded-[2px] bg-foreground/20">
					<View
						className="h-full rounded-[2px] bg-foreground"
						style={{ width: `${displayProgress * 100}%` }}
					/>
				</View>

				{barWidth > 0 && (
					<View
						className="absolute bg-foreground"
						style={{
							width: dotSize,
							height: dotSize,
							borderRadius: dotSize / 2,
							left: displayProgress * barWidth - dotSize / 2,
							top: (3 - dotSize) / 2,
						}}
					/>
				)}
			</View>

			<View className="flex-row items-center gap-[10px] px-3 py-2">
				<Image source={{ uri: currentTrack.artwork }} className="h-11 w-11 rounded-md" />
				<View className="flex-1 gap-0.5">
					<Text
						className="text-sm font-semibold tracking-tight text-foreground"
						numberOfLines={1}
					>
						{currentTrack.title}
					</Text>
					<View className="text-xs text-muted">
						<Pressable onPress={() => router.push(`/artist/${currentTrack.artist.id}`)}>
							<Text>{currentTrack.artist.name}</Text>
						</Pressable>
					</View>
				</View>

				<Text className="text-[11px] text-muted">
					{`${formatTime(displayPosition)} / ${formatTime(duration)}`}
				</Text>

				<View className="flex-row items-center gap-3">
					<TouchableOpacity
						disabled={currentIndex === 0}
						onPress={previous}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
					>
						<IconSymbol
							name="backward.fill"
							size={18}
							color={
								currentIndex === 0 ? "var(--color-muted)" : "var(--color-foreground)"
							}
						/>
					</TouchableOpacity>

					<PausePlayButton />

					<TouchableOpacity
						disabled={currentIndex === queue.length - 1}
						onPress={next}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
					>
						<IconSymbol
							name="forward.fill"
							size={18}
							color={
								currentIndex === queue.length - 1
									? "var(--color-muted)"
									: "var(--color-foreground)"
							}
						/>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}
