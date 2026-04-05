import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { searchPlaylists } from "@/api";
import { MediaCard } from "@/components/media-card";

const GRID_INITIAL = 6;

function pairs<T>(arr: T[]): T[][] {
	const result: T[][] = [];
	for (let i = 0; i < arr.length; i += 2) {
		result.push(arr.slice(i, i + 2));
	}
	return result;
}

export function Popular() {
	const [showAll, setShowAll] = useState(false);
	const router = useRouter();

	const { data: playlists, isLoading } = useQuery({
		queryKey: ["popular-playlists"],
		queryFn: ({ signal }) => searchPlaylists("top hits", { limit: 20 }, signal),
		select: (data) => data.data.playlists.items,
		staleTime: 10 * 60 * 1000,
	});

	const visible = useMemo(
		() => {
			if(playlists) {
				const p = playlists.filter((p) => p.numberOfTracks > 0);
				
				return showAll ? p 	: p.slice(0, GRID_INITIAL);
			}

			return [];
		},
		[playlists, showAll],
	);

	if (!playlists || isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<View className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
			</View>
		);
	}

	if (!visible.length) return null;

	return (
		<View className="px-5">
			<Text className="text-base font-bold text-foreground mb-3">
				Popular
			</Text>
			<View className="gap-3">
				{pairs(visible).map((row, i) => (
					<View key={i} className="flex-row gap-3">
						{row.map((playlist) => (
							<MediaCard
								key={`${playlist.uuid}-popular`}
								image={playlist.squareImage ?? playlist.image}
								title={playlist.title}
								onPress={() => router.push(`/playlist/${playlist.uuid}`)}
								className="flex-1 p-2"
							>
								<Text className="text-xs text-muted" numberOfLines={1}>
									{playlist.numberOfTracks} tracks
								</Text>
							</MediaCard>
						))}
						{row.length === 1 && <View className="flex-1" />}
					</View>
				))}
			</View>
			{playlists && playlists.length > GRID_INITIAL && (
				<Pressable
					className="mt-4 mb-6 self-center"
					onPress={() => setShowAll((v) => !v)}
				>
					<Text className="text-sm text-muted">
						{showAll ? "Show less" : "Show more"}
					</Text>
				</Pressable>
			)}
		</View>
	);
}
