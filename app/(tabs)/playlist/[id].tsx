import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { getPlaylistDetail } from "@/api";
import { TrackListPage } from "@/components/pages/track-list-page";

export default function PlaylistPage() {
	const { id, title, image } = useLocalSearchParams<{
		id: string;
		title: string;
		image: string;
	}>();

	const { data, isLoading } = useQuery({
		queryKey: ["playlist", id],
		queryFn: ({ signal }) => getPlaylistDetail(id, {}, signal),
		enabled: !!id,
	});

	if (!data || isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<View className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
			</View>
		);
	}

	const { playlist, items} = data;

	return (
		<TrackListPage
			title={playlist.title ?? title ?? "Playlist"}
			type="playlist"
			subtitle={playlist ? `${playlist.numberOfTracks} tracks` : undefined}
			image={playlist.squareImage ?? playlist.image ?? image}
			tracks={items ?? []}
			id={id}
		/>
	);
}
