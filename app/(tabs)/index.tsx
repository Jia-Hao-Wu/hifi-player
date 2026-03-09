import { ThemedView } from "@/components/themed-view";
import { Searchbox } from "@/components/ui/search-box";

export default function HomeScreen() {
	return (
		<ThemedView className="p-4 h-full flex flex-col gap-4">
			<Searchbox id="search" name="search" />
			<div className="h-full"></div>
		</ThemedView>
	);
}
