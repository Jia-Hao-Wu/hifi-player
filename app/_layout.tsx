import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "react-native-reanimated";

import "../global.css";

import { themes } from "@/constants/colors";
import { PlayerProvider } from "@/contexts/player-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

const queryClient = new QueryClient();

export const unstable_settings = {
	anchor: "(tabs)",
};

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<View style={[{ flex: 1 }, themes[(colorScheme === "dark" ? "dark" : "light")]]}>
					<QueryClientProvider client={queryClient}>
						<PlayerProvider>
							<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
								<SafeAreaView style={{ flex: 1 }}>
									<Stack>
										<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
										<Stack.Screen
											name="modal"
											options={{ presentation: "modal", title: "Modal" }}
										/>
									</Stack>
								</SafeAreaView>
								<StatusBar style="auto" />
							</ThemeProvider>
						</PlayerProvider>
					</QueryClientProvider>
				</View>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
