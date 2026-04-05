import { useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Pressable, ScrollView, Text, View } from "react-native";

type Tab = {
	label: string;
	content: React.ReactNode;
	onEndReached?: () => void;
};

type TabsProps = {
	tabs: Tab[];
	defaultIndex?: number;
	onTabChange?: (index: number) => void;
};

const END_REACHED_THRESHOLD = 200;

export function Tabs({ tabs, defaultIndex = 0, onTabChange }: TabsProps) {
	const [activeIndex, setActiveIndex] = useState(defaultIndex);

	const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { layoutMeasurement, contentSize, contentOffset } = e.nativeEvent;
		const distanceFromEnd = contentSize.height - layoutMeasurement.height - contentOffset.y;
		if (distanceFromEnd < END_REACHED_THRESHOLD) {
			tabs[activeIndex]?.onEndReached?.();
		}
	};

	return (
		<View className="flex min-h-0 flex-1 flex-col">
			<View className="flex-row gap-1 justify-evenly">
				{tabs.map((tab, index) => (
					<Pressable
						key={tab.label}
						onPress={() => { setActiveIndex(index); onTabChange?.(index); }}
						className={`px-4 py-2 border-b-2 -mb-px ${
							index === activeIndex
								? "border-foreground"
								: "border-transparent"
						}`}
					>
						<Text
							className={`text-sm font-medium ${
								index === activeIndex ? "text-foreground" : "text-muted"
							}`}
						>
							{tab.label}
						</Text>
					</Pressable>
				))}
			</View>
			<ScrollView
				className="min-h-0 flex-1 pt-4"
				onScroll={handleScroll}
				scrollEventThrottle={400}
			>
				{tabs[activeIndex]?.content}
			</ScrollView>
		</View>
	);
}
