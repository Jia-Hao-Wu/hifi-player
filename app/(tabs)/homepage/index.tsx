import { searchTracks } from "@/api";
import { ThemedView } from "@/components/themed-view";
import { Searchbox } from "@/components/ui/search-box";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

export default function HomeScreen() {
	const handleSearch = useDebouncedCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;

			const response = await searchTracks(value);

			console.log(response);
		},
		300,
	);

	return (
		<ThemedView className="p-4 h-full flex flex-col gap-4">
			<Searchbox id="search" name="search" onChange={handleSearch} />
			<Tabs
				tabs={[
					{ label: "Tracks", content: <div>Tracks</div> },
					{ label: "Playlists", content: <div>Playlists</div> },
					{ label: "Artists", content: <div>Artists</div> },
					{ label: "Albums", content: <div>Albums</div> },
				]}
			/>
		</ThemedView>
	);
}
