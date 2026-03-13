import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type Tab = {
	label: string;
	content: React.ReactNode;
};

type TabsProps = {
	tabs: Tab[];
	defaultIndex?: number;
};

export function Tabs({ tabs, defaultIndex = 0 }: TabsProps) {
	const [activeIndex, setActiveIndex] = useState(defaultIndex);

	return (
		<View className="flex min-h-0 flex-1 flex-col">
			<View className="flex-row gap-1 border-b border-foreground/10 justify-evenly">
				{tabs.map((tab, index) => (
					<Pressable
						key={tab.label}
						onPress={() => setActiveIndex(index)}
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
			<ScrollView className="min-h-0 flex-1 pt-4">{tabs[activeIndex]?.content}</ScrollView>
		</View>
	);
}
