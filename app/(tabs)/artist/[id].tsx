 import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
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
			<div className="flex flex-1 flex-col items-center justify-center bg-background">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
			</div>
		);
	}

	const { artist, tracks, albums, similarArtists } = data;
	const visibleTracks = showAllTracks ? tracks : tracks.slice(0, INITIAL_TRACKS);
	const visibleAlbums = showAllAlbums ? albums : albums.slice(0, INITIAL_ALBUMS);

	return (
		<div className="flex flex-1 flex-col bg-background overflow-y-auto">
			<div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-background/80 backdrop-blur">
				<button onClick={() => router.back()} className="text-foreground">
					<IconSymbol name="chevron.left" color="var(--color-foreground)" />
				</button>
				<span className="text-sm text-foreground font-medium truncate">
					{artist.name}
				</span>
			</div>

			<div className="flex flex-col items-center px-4 pb-4">
				<img
					src={artworkUrl(artist.picture, ARTWORK_SIZES.medium)}
					className="w-48 h-48 rounded-full object-cover"
				/>
				<div className="mt-3 text-center">
					<div className="text-base text-foreground font-medium">{artist.name}</div>
				</div>
			</div>

			<Tabs tabs={[
				{
					label: `Tracks (${tracks.length})`,
					content: tracks.length > 0 && (
						<div>
							<div className="flex flex-col">
								{visibleTracks.map((track, index) => (
									<Track key={track.id} track={track} index={index} />
								))}
							</div>
							{tracks.length > INITIAL_TRACKS && (
								<button
									onClick={() => setShowAllTracks((v) => !v)}
									className="w-full py-2 text-xs text-muted hover:text-foreground transition-colors"
								>
									{showAllTracks ? "Show Less" : `Show More (${tracks.length - INITIAL_TRACKS} more)`}
								</button>
							)}
						</div>
					),
				},
				{
					label: `Albums (${albums.length})`,
					content: albums.length > 0 && (
						<div>
							<div className="grid grid-cols-2 gap-2 px-4">
								{visibleAlbums.map((album) => (
									<div
										key={album.id}
										className="group flex flex-col items-start gap-2 p-2 bg-orange-950/50 rounded-sm overflow-visible cursor-pointer"
										onClick={() => router.push(`/album/${album.id}`)}
									>
										<div className="flex rounded-md overflow-visible relative">
											<img
												src={artworkUrl(album.cover, ARTWORK_SIZES.medium)}
												className="rounded-md object-contain"
											/>
										</div>
										<div className="min-w-0 w-full">
											<div className="text-xs text-foreground truncate">{album.title}</div>
											{album.releaseDate && (
												<div className="text-[0.6rem] text-muted">
													{album.releaseDate.slice(0, 4)}
												</div>
											)}
										</div>
									</div>
								))}
							</div>
							{albums.length > INITIAL_ALBUMS && (
								<button
									onClick={() => setShowAllAlbums((v) => !v)}
									className="w-full py-2 text-xs text-muted hover:text-foreground transition-colors"
								>
									{showAllAlbums ? "Show Less" : `Show More (${albums.length - INITIAL_ALBUMS} more)`}
								</button>
							)}
						</div>
					),
				},
			]} />

			{similarArtists.length > 0 && (
				<div className="mt-4">
					<div className="px-4 py-2 text-xs text-muted font-medium uppercase">
						Similar Artists
					</div>
					<div className="flex gap-3 px-4 pb-4 overflow-x-auto">
						{similarArtists.map((a) => (
							<div
								key={a.id}
								className="flex flex-col items-center gap-2 shrink-0 cursor-pointer"
								onClick={() => router.push(`/artist/${a.id}`)}
							>
								<img
									src={artworkUrl(a.picture, ARTWORK_SIZES.thumbnail)}
									className="w-20 h-20 rounded-full object-cover"
								/>
								<span className="text-xs text-foreground text-center w-20 truncate">
									{a.name}
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
