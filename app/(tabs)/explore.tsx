import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";

export default function TabTwoScreen() {
	return (
		<ThemedView>
			<ThemedText
				type="title"
				style={{
					fontFamily: Fonts.rounded,
				}}
			>
				Explore
			</ThemedText>
		</ThemedView>
	);
}
