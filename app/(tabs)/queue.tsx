import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	SharedValue,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePlayer } from "@/contexts/player-context";
import type { Track } from "@/constants/tracks";

const ITEM_HEIGHT = 64;

export default function QueueScreen() {
	const { trackList, currentIndex, moveTrack, removeTrack, jumpTo } = usePlayer();

	const [scrollEnabled, setScrollEnabled] = useState(true);
	const activeIndex = useSharedValue(-1);
	const activeTranslateY = useSharedValue(0);
	const hoverIndex = useSharedValue(-1);

	if (trackList.length === 0) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Text className="text-sm text-muted">Queue is empty</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<View className="px-5 pt-4 pb-2">
				<Text className="text-lg font-bold text-foreground">Queue</Text>
				<Text className="text-xs text-muted mt-0.5">
					{trackList.length} track{trackList.length !== 1 ? "s" : ""}
				</Text>
			</View>
			<ScrollView scrollEnabled={scrollEnabled}>
				{trackList.map((track, index) => (
					<QueueItem
						key={track.id}
						track={track}
						index={index}
						isCurrent={index === currentIndex}
						totalCount={trackList.length}
						activeIndex={activeIndex}
						activeTranslateY={activeTranslateY}
						hoverIndex={hoverIndex}
						onJump={() => jumpTo(index)}
						onRemove={() => removeTrack(index)}
						onReorder={moveTrack}
						onDragStart={() => setScrollEnabled(false)}
						onDragEnd={() => setScrollEnabled(true)}
					/>
				))}
			</ScrollView>
		</View>
	);
}

function QueueItem({
	track,
	index,
	isCurrent,
	totalCount,
	activeIndex,
	activeTranslateY,
	hoverIndex,
	onJump,
	onRemove,
	onReorder,
	onDragStart,
	onDragEnd,
}: {
	track: Track;
	index: number;
	isCurrent: boolean;
	totalCount: number;
	activeIndex: SharedValue<number>;
	activeTranslateY: SharedValue<number>;
	hoverIndex: SharedValue<number>;
	onJump: () => void;
	onRemove: () => void;
	onReorder: (from: number, to: number) => void;
	onDragStart: () => void;
	onDragEnd: () => void;
}) {
	const gesture = Gesture.Pan()
		.activateAfterLongPress(200)
		.onStart(() => {
			activeIndex.value = index;
			hoverIndex.value = index;
			runOnJS(onDragStart)();
		})
		.onUpdate((e) => {
			activeTranslateY.value = e.translationY;
			const raw = activeIndex.value + Math.round(e.translationY / ITEM_HEIGHT);
			hoverIndex.value = Math.max(0, Math.min(raw, totalCount - 1));
		})
		.onEnd(() => {
			runOnJS(onReorder)(activeIndex.value, hoverIndex.value);
		})
		.onFinalize(() => {
			activeIndex.value = -1;
			hoverIndex.value = -1;
			activeTranslateY.value = 0;
			runOnJS(onDragEnd)();
		});

	const animatedStyle = useAnimatedStyle(() => {
		if (activeIndex.value === index) {
			return {
				transform: [{ translateY: activeTranslateY.value }, { scale: 1.03 }],
				zIndex: 100,
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.25,
				shadowRadius: 8,
				elevation: 8,
			};
		}

		if (activeIndex.value === -1) {
			return {
				transform: [{ translateY: withTiming(0, { duration: 200 }) }],
				zIndex: 0,
			};
		}

		const active = activeIndex.value;
		const hover = hoverIndex.value;
		let shift = 0;

		if (active < hover && index > active && index <= hover) {
			shift = -ITEM_HEIGHT;
		} else if (active > hover && index >= hover && index < active) {
			shift = ITEM_HEIGHT;
		}

		return {
			transform: [{ translateY: withTiming(shift, { duration: 200 }) }],
			zIndex: 0,
		};
	});

	const duration = track.duration
		? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, "0")}`
		: "";

	return (
		<GestureDetector gesture={gesture}>
			<Animated.View style={animatedStyle}>
				<Pressable
					className={`flex-row items-center h-16 px-4 ${isCurrent ? "bg-accent" : ""}`}
					onPress={onJump}
				>
					<Text className="text-xs text-muted w-6 text-right mr-2">{index + 1}</Text>
					<Image source={{ uri: track.artwork }} className="h-10 w-10 rounded" />
					<View className="flex-1 min-w-0 ml-3">
						<Text
							className={`text-sm text-foreground ${isCurrent ? "font-semibold" : ""}`}
							numberOfLines={1}
						>
							{track.title}
						</Text>
						<Text className="text-xs text-muted" numberOfLines={1}>
							{track.artist.name}
						</Text>
					</View>
					{duration ? <Text className="text-xs text-muted">{duration}</Text> : null}
					<Pressable onPress={onRemove} hitSlop={8} className="px-2">
						<IconSymbol name="xmark" size={14} className="text-muted" />
					</Pressable>
					<IconSymbol name="line.3.horizontal" size={20} className="text-muted ml-1" />
				</Pressable>
			</Animated.View>
		</GestureDetector>
	);
}
