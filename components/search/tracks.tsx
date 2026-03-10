import type { SearchTrack } from "@/api";

type TracksProps = {
	results?: SearchTrack[];
	isLoading?: boolean;
};

export function Tracks({ results, isLoading }: TracksProps) {
	if (isLoading) return <div className="text-muted text-sm">Loading...</div>;
	if (!results?.length) return null;

	return (
		<div className="flex flex-col gap-2">
			{results.map((track) => (
				<div key={track.id} className="flex items-center gap-3 py-1">
					<div className="flex-1 min-w-0">
						<div className="text-sm text-foreground truncate">{track.title}</div>
						<div className="text-xs text-muted truncate">{track.artist.name}</div>
					</div>
				</div>
			))}
		</div>
	);
}
