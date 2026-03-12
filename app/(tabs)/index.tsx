import { useState } from "react";

import { ThemedView } from "@/components/themed-view";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { Playlists } from "@/components/search/playlists";
import { Searchbox } from "@/components/search/search-box";

import { Tracks } from "@/components/search/tracks";
import { Artists } from "@/components/search/artists";
import { Albums } from "@/components/search/albums";

export default function HomeScreen() {
	const [query, setQuery] = useState("");

	const handleSearch = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	}, 300);

	return (
		<div className="flex flex-1 flex-col overflow-hidden bg-background">
			<div className="p-4">
				<Searchbox id="search" name="search" onChange={handleSearch} />
			</div>
			{query && (
				<Tabs
					tabs={[
						{
							label: "Tracks",
							content: <Tracks query={query} />,
						},
						{
							label: "Artists",
							content: <Artists query={query} />,
						},
						{
							label: "Playlists",
							content: <Playlists query={query} />,
						},
						{
							label: "Albums",
							content: <Albums query={query} />,
						},
					]}
				/>
			)}
		</div>
	);
}
