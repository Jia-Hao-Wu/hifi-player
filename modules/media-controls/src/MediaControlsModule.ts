import { requireNativeModule } from "expo-modules-core";
import type { EventSubscription } from "expo-modules-core/src/ts-declarations/EventEmitter";
import type { TrackInfo, PlaybackState, MediaControlEvent } from "./MediaControls.types";

type MediaControlsEvents = {
	onMediaControlPlay: () => void;
	onMediaControlPause: () => void;
	onMediaControlNext: () => void;
	onMediaControlPrevious: () => void;
	onMediaControlSeekTo: (event: { position: number }) => void;
};

const MediaControls = requireNativeModule<{
	updateNowPlaying(info: TrackInfo): void;
	updatePlaybackState(state: PlaybackState): void;
	stop(): void;
	addListener<K extends keyof MediaControlsEvents>(
		eventName: K,
		listener: MediaControlsEvents[K],
	): EventSubscription;
}>("MediaControls");

export function updateNowPlaying(info: TrackInfo): void {
	MediaControls.updateNowPlaying(info);
}

export function updatePlaybackState(state: PlaybackState): void {
	MediaControls.updatePlaybackState(state);
}

export function stop(): void {
	MediaControls.stop();
}

export function addMediaControlListener(
	callback: (event: MediaControlEvent) => void,
): EventSubscription {
	const subs = [
		MediaControls.addListener("onMediaControlPlay", () => callback({ type: "play" })),
		MediaControls.addListener("onMediaControlPause", () => callback({ type: "pause" })),
		MediaControls.addListener("onMediaControlNext", () => callback({ type: "next" })),
		MediaControls.addListener("onMediaControlPrevious", () => callback({ type: "previous" })),
		MediaControls.addListener("onMediaControlSeekTo", (event) =>
			callback({ type: "seekTo", position: event.position }),
		),
	];

	return {
		remove: () => subs.forEach((s) => s.remove()),
	};
}
