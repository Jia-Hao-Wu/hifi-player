import { useRouter } from "expo-router";
import { TouchableOpacity, ActivityIndicator } from "react-native";
import { ARTWORK_SIZES, artworkUrl } from "@/api/images";
import { usePlayer } from "@/contexts/player-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { TrackMeta } from "@/api/metadata";

type TrackListPageProps = {
	title: string;
	id: string;
	subtitle?: string;
	image: string | undefined;
	tracks: { item: TrackMeta }[];
};

export function TrackListPage({
	title,
	id,
	subtitle,
	image,
	tracks,
}: TrackListPageProps) {
	const router = useRouter();
	const { currentTrack, isPlaying, enQueue, replaceQueue, pause, play, currentListId } =
		usePlayer();

	return (
		<div className="flex flex-1 flex-col bg-background overflow-y-auto">
			<div className="sticky top-0 z-10 flex justify-between items-center gap-3 p-2 bg-background/80 backdrop-blur">
				<button
					onClick={() => router.back()}
					className="flex items-center justify-center text-foreground"
				>
					<IconSymbol name="chevron.left" size={30} color="var(--color-foreground)" />
				</button>
			</div>

			<div className="flex flex-col items-center px-4 pb-4">
				{image && (
					<img
						src={artworkUrl(image, ARTWORK_SIZES.large)}
						className="w-48 h-48 rounded-md object-contain"
					/>
				)}
				<div className="mt-3 text-center">
					<div className="text-base text-foreground font-medium">{title}</div>
					{subtitle && <div className="text-xs text-muted">{subtitle}</div>}
				</div>
				<div className="mt-5">
					<TouchableOpacity
						onPress={() => {
							if (id === currentListId) {
								return isPlaying ? pause() : play();
							}

							replaceQueue(
								tracks.map(({ item: track }) => ({
									id: track.id,
									title: track.title,
									artist: track.artist.name,
									album: track.album?.title,
									artwork: artworkUrl(track.album?.cover, ARTWORK_SIZES.thumbnail),
									tidalId: track.id,
									duration: track.duration,
								})),
								id,
							);
						}}
						className="h-9 w-9 items-center justify-center rounded-full bg-foreground"
					>
						<IconSymbol
							name={isPlaying && id === currentListId ? "pause.fill" : "play.fill"}
							size={20}
							color="var(--color-background)"
						/>
					</TouchableOpacity>
				</div>
			</div>

			<div className="flex flex-col">
				{tracks.map(({ item: track }, index) => (
					<div
						key={track.id}
						className={`group flex items-center gap-3 py-2 px-4 hover:bg-white/10 cursor-pointer ${currentTrack?.id === track.id ? "bg-accent" : ""}`}
						onClick={() => {
							enQueue({
								id: track.id,
								title: track.title,
								artist: track.artist.name,
								album: track.album?.title,
								artwork: artworkUrl(track.album?.cover, ARTWORK_SIZES.thumbnail), 
								tidalId: track.id,
								duration: track.duration,
							});
						}}
					>
						<span className="w-6 text-xs text-muted">{index + 1}</span>
						<div className="flex-1 min-w-0">
							<div className="text-sm text-foreground truncate">{track.title}</div>
							<div className="text-xs text-muted truncate">{track.artist.name}</div>
						</div>
						<div className="text-xs text-muted">
							{Math.floor(track.duration / 60)}:
							{(track.duration % 60).toString().padStart(2, "0")}
						</div>
						<IconSymbol
							className="m-auto"
							name={
								currentTrack?.id === track.id && isPlaying ? "pause.fill" : "play.fill"
							}
							color="var(--color-foreground)"
						/>
					</div>
				))}
			</div>
		</div>
	);
}
