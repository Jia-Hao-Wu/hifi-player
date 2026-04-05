import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { ARTWORK_SIZES, artworkUrl, getRecommendations } from "@/api";
import { MediaCard } from "@/components/media-card";
import { usePlayer } from "@/contexts/player-context";
import { usePlaylistStorage } from "@/contexts/playlist-storage";

export function Recommended() {
	const { currentTrack, enQueue } = usePlayer();
	const { playlists } = usePlaylistStorage();

	const seedId = useMemo(() => {
		if (currentTrack?.tidalId) return currentTrack.tidalId;
		const allTracks = playlists.flatMap((p) => p.tracks).filter((t) => t.tidalId);
		if (allTracks.length === 0) return null;
		return allTracks[Math.floor(Math.random() * allTracks.length)].tidalId!;
	}, [currentTrack?.tidalId, playlists]);

	const { data: recommendations } = useQuery({
		queryKey: ["recommendations", seedId],
		queryFn: ({ signal }) => getRecommendations(seedId!, signal),
		enabled: !!seedId,
		select: (data) => data.items,
		staleTime: 5 * 60 * 1000,
	});

	if (!recommendations?.length) return null;

	return (
		<View className="mb-6">
			<Text className="text-base font-bold text-foreground px-5 mb-3">
				Recommended
			</Text>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
			>
				{recommendations.map((rec) => (
					<MediaCard
						key={rec.id}
						image={rec.album.cover}
						title={rec.title}
						className="w-32"
						onPress={() =>
							enQueue({
								id: String(rec.id),
								tidalId: String(rec.id),
								title: rec.title,
								artist: rec.artist,
								album: rec.album.title,
								cover: rec.album.cover,
								artwork: artworkUrl(rec.album.cover, ARTWORK_SIZES.medium),
								duration: rec.duration,
							})
						}
					>
						<Text className="text-[11px] text-muted" numberOfLines={1}>
							{rec.artist.name}
						</Text>
					</MediaCard>
				))}
			</ScrollView>
		</View>
	);
}
