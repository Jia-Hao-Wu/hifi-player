import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { getArtistDetail } from "@/api";
import { ARTWORK_SIZES, artworkUrl } from "@/api/images";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Tabs } from "@/components/ui/tabs";
import { getArtistTracks, getSimilarArtists } from "@/api/metadata";
import { Track } from "@/components/player-ui/track";

const INITIAL_TRACKS = 5;
const INITIAL_ALBUMS = 4;

export default function ArtistPage() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const [showAllTracks, setShowAllTracks] = useState(false);
	const [showAllAlbums, setShowAllAlbums] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ["artist", id],
		queryFn: ({ signal }) =>
			Promise.all([
				getArtistDetail(id, {}, signal),
				getArtistTracks(id, {}, signal),
				getSimilarArtists(id, {}, signal),
			]),
		select: ([{ artist }, { tracks, albums }, { artists: similarArtists }]) => ({
			artist,
			tracks,
			albums: albums.items,
			similarArtists,
		}),
		enabled: !!id,
	});

	if (isLoading || !data) {
		return (
			<View className="flex flex-1 flex-col items-center justify-center bg-background">
				<View className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
			</View>
		);
	}

	const { artist, tracks, albums, similarArtists } = data;
	const visibleTracks = showAllTracks ? tracks : tracks.slice(0, INITIAL_TRACKS);
	const visibleAlbums = showAllAlbums ? albums : albums.slice(0, INITIAL_ALBUMS);

	return (
		<ScrollView className="flex flex-1 flex-col bg-background">
			<View className="sticky top-0 z-10 flex-row items-center gap-3 px-4 py-3 bg-background/80 backdrop-blur">
				<Pressable onPress={() => router.back()} className="text-foreground">
					<IconSymbol name="chevron.left" color="var(--color-foreground)" />
				</Pressable>
				<Text className="text-sm text-foreground font-medium" numberOfLines={1}>
					{artist.name}
				</Text>
			</View>

			<View className="flex flex-col items-center px-4 pb-4">
				<Image
					source={{ uri: artworkUrl(artist.picture, ARTWORK_SIZES.medium) }}
					className="w-48 h-48 rounded-full"
					resizeMode="cover"
				/>
				<View className="mt-3 items-center">
					<Text className="text-base text-foreground font-medium">{artist.name}</Text>
				</View>
			</View>

			<Tabs tabs={[
				{
					label: `Tracks (${tracks.length})`,
					content: tracks.length > 0 && (
						<View>
							<View className="flex flex-col">
								{visibleTracks.map((track, index) => (
									<Track key={track.id} track={track} index={index} />
								))}
							</View>
							{tracks.length > INITIAL_TRACKS && (
								<Pressable
									onPress={() => setShowAllTracks((v) => !v)}
									className="w-full py-2 items-center"
								>
									<Text className="text-xs text-muted">
										{showAllTracks ? "Show Less" : `Show More (${tracks.length - INITIAL_TRACKS} more)`}
									</Text>
								</Pressable>
							)}
						</View>
					),
				},
				{
					label: `Albums (${albums.length})`,
					content: albums.length > 0 && (
						<View>
							<View className="flex-row flex-wrap gap-2 px-4">
								{visibleAlbums.map((album) => (
									<Pressable
										key={album.id}
										className="w-[48%] flex flex-col items-start gap-2 p-2 bg-orange-950/50 rounded-sm overflow-visible"
										onPress={() => router.push(`/album/${album.id}`)}
									>
										<View className="flex rounded-md overflow-visible relative">
											<Image
												source={{ uri: artworkUrl(album.cover, ARTWORK_SIZES.medium) }}
												className="w-full aspect-square rounded-md"
												resizeMode="contain"
											/>
										</View>
										<View className="min-w-0 w-full">
											<Text className="text-xs text-foreground" numberOfLines={1}>{album.title}</Text>
											{album.releaseDate && (
												<Text className="text-[10px] text-muted">
													{album.releaseDate.slice(0, 4)}
												</Text>
											)}
										</View>
									</Pressable>
								))}
							</View>
							{albums.length > INITIAL_ALBUMS && (
								<Pressable
									onPress={() => setShowAllAlbums((v) => !v)}
									className="w-full py-2 items-center"
								>
									<Text className="text-xs text-muted">
										{showAllAlbums ? "Show Less" : `Show More (${albums.length - INITIAL_ALBUMS} more)`}
									</Text>
								</Pressable>
							)}
						</View>
					),
				},
			]} />

			{similarArtists.length > 0 && (
				<View className="mt-4">
					<Text className="px-4 py-2 text-xs text-muted font-medium uppercase">
						Similar Artists
					</Text>
					<ScrollView horizontal className="px-4 pb-4" contentContainerClassName="gap-3">
						{similarArtists.map((a) => (
							<Pressable
								key={a.id}
								className="flex flex-col items-center gap-2"
								onPress={() => router.push(`/artist/${a.id}`)}
							>
								<Image
									source={{ uri: artworkUrl(a.picture, ARTWORK_SIZES.thumbnail) }}
									className="w-20 h-20 rounded-full"
									resizeMode="cover"
								/>
								<Text className="text-xs text-foreground text-center w-20" numberOfLines={1}>
									{a.name}
								</Text>
							</Pressable>
						))}
					</ScrollView>
				</View>
			)}
		</ScrollView>
	);
}
