import { useRef, useState } from "react";
import { PanResponder, View } from "react-native";
import { useScrubber } from "@/contexts/scrubber-context";
import { MinMax } from "@/utils";

export function ProgressBar() {
	const { displayProgress, isScrubbing, startScrub, moveScrub, endScrub, cancelScrub } =
		useScrubber();
	const [localWidth, setLocalWidth] = useState(0);
	const localWidthRef = useRef(0);
	const startRatioRef = useRef(0);

	const dotSize = isScrubbing ? 14 : 10;

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: () => true,
			onPanResponderGrant: (evt) => {
				if (!localWidthRef.current) return;
				const ratio = MinMax(0, 1, evt.nativeEvent.locationX / localWidthRef.current);
				startRatioRef.current = ratio;
				startScrub(ratio);
			},
			onPanResponderMove: (_evt, gestureState) => {
				moveScrub(startRatioRef.current, gestureState.dx, localWidthRef.current);
			},
			onPanResponderRelease: (_evt, gestureState) => {
				endScrub(startRatioRef.current, gestureState.dx, localWidthRef.current);
			},
			onPanResponderTerminate: () => {
				cancelScrub();
			},
		}),
	).current;

	return (
		<View style={{ zIndex: 1 }}>
			<View className="h-[3px] overflow-hidden rounded-[2px] bg-foreground/20">
				<View
					className="h-full rounded-[2px] bg-foreground"
					style={{ width: `${displayProgress * 100}%` }}
				/>
			</View>

			{localWidth > 0 && (
				<View
					className="absolute bg-foreground"
					style={{
						width: dotSize,
						height: dotSize,
						borderRadius: dotSize / 2,
						left: displayProgress * localWidth - dotSize / 2,
						top: (3 - dotSize) / 2,
					}}
				/>
			)}

			<View
				onLayout={(e) => {
					const w = e.nativeEvent.layout.width;
					setLocalWidth(w);
					localWidthRef.current = w;
				}}
				{...panResponder.panHandlers}
				className="absolute inset-0 -top-3 -bottom-3"
			/>
		</View>
	);
}
