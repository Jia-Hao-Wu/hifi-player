import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useIsFetching } from "@tanstack/react-query";

import { Searchbox } from "@/components/search/search-box";
import { Tracks } from "@/components/search/tracks";
import { Artists } from "@/components/search/artists";
import { Albums } from "@/components/search/albums";
import { Playlists } from "@/components/search/playlists";
import { Recommended } from "@/components/home/recommended";
import { Popular } from "@/components/home/popular";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

export default function HomeScreen() {
	const [query, setQuery] = useState("");
	const homeFetching = useIsFetching({ queryKey: ["popular-playlists"] }) + useIsFetching({ queryKey: ["recommendations"] });
	const tracksEndRef = useRef<(() => void) | undefined>(undefined);
	const artistsEndRef = useRef<(() => void) | undefined>(undefined);
	const playlistsEndRef = useRef<(() => void) | undefined>(undefined);
	const albumsEndRef = useRef<(() => void) | undefined>(undefined);

	const handleSearch = useDebouncedCallback((text: string) => {
		setQuery(text);
	}, 300);

	return (
		<View className="flex flex-1 flex-col overflow-hidden bg-background">
			<View className="p-4">
				<Searchbox onChangeText={handleSearch} placeholder="Search tracks, artists, playlists..." />
			</View>
			{query ? (
				<Tabs
					tabs={[
						{
							label: "Tracks",
							content: <Tracks query={query} onEndReachedRef={tracksEndRef} />,
							onEndReached: () => tracksEndRef.current?.(),
						},
						{
							label: "Artists",
							content: <Artists query={query} onEndReachedRef={artistsEndRef} />,
							onEndReached: () => artistsEndRef.current?.(),
						},
						{
							label: "Playlists",
							content: <Playlists query={query} onEndReachedRef={playlistsEndRef} />,
							onEndReached: () => playlistsEndRef.current?.(),
						},
						{
							label: "Albums",
							content: <Albums query={query} onEndReachedRef={albumsEndRef} />,
							onEndReached: () => albumsEndRef.current?.(),
						},
					]}
				/>
			) : (
				<ScrollView className="flex-1">
					{homeFetching > 0 && (
						<View className="py-8 items-center">
							<View className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
						</View>
					)}
					<Recommended />
					<Popular />
				</ScrollView>
			)}
		</View>
	);
}
