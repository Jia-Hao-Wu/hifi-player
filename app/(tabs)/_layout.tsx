import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { useColorScheme, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { PlayerControls } from "@/components/player-ui/player-controls";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: colorScheme === "dark" ? "#fff" : "#000",
				headerShown: false,
				tabBarButton: HapticTab
			}}
			tabBar={(props) => (
				<View>
					<PlayerControls />
					<BottomTabBar {...props} />
				</View>
			)}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="house.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="library"
				options={{
					title: "Library",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="paperplane.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="queue"
				options={{
					title: "Queue",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="list.bullet" color={color} />
					),
				}}
			/>
			<Tabs.Screen name="album/[id]" options={{ href: null }} />
			<Tabs.Screen name="artist/[id]" options={{ href: null }} />
			<Tabs.Screen name="playlist/[id]" options={{ href: null }} />
		</Tabs>
	);
}
