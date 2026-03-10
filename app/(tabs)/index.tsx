import { useState } from "react";
import { Searchbox } from "@/components/search/search-box";
import { Tracks } from "@/components/search/tracks";
import { ThemedView } from "@/components/themed-view";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useSearchTracks } from "@/hooks/use-search";

export default function HomeScreen() {
	const [query, setQuery] = useState("");

	const handleSearch = useDebouncedCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setQuery(e.target.value);
		},
		300,
	);

	const { data, isLoading } = useSearchTracks(query);

	return (
		<ThemedView className="p-4 h-full flex flex-col gap-4">
			<Searchbox id="search" name="search" onChange={handleSearch} />
			<Tabs
				tabs={[
					{ label: "Tracks", content: <Tracks results={data?.items} isLoading={isLoading} /> },
					{ label: "Playlists", content: <div>Playlists</div> },
					{ label: "Artists", content: <div>Artists</div> },
					{ label: "Albums", content: <div>Albums</div> },
				]}
			/>
		</ThemedView>
	);
}
