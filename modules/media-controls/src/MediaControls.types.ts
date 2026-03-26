export interface TrackInfo {
	title: string;
	artist: string;
	album?: string;
	artworkUrl?: string;
	duration: number; // seconds
}

export interface PlaybackState {
	isPlaying: boolean;
	position: number; // seconds
	playbackRate?: number;
}

export type MediaControlEvent =
	| { type: "play" }
	| { type: "pause" }
	| { type: "next" }
	| { type: "previous" }
	| { type: "seekTo"; position: number };
