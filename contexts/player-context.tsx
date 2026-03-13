import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from "expo-audio";

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

import { getTrackStream } from "@/api";
import { Track } from "@/constants/tracks";

interface PlayerContextType {
	currentIndex: number;
	currentTrack: Track | null;
	isPlaying: boolean;
	isLoading: boolean;
	position: number;
	duration: number;
	queue: Track[];
	currentListId?: string;
	replaceQueue: (tracks: Track[], currentListId: string) => Promise<void>;
	enQueue: (track: Track) => Promise<void>;
	play: () => Promise<void>;
	pause: () => Promise<void>;
	next: () => Promise<void>;
	previous: () => Promise<void>;
	seek: (positionSeconds: number) => Promise<void>;
	loadTrack: (track: Track) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
	const [queue, setQueue] = useState<Track[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [wantsToPlay, setWantsToPlay] = useState(false);
	const [currentListId, setCurrentListId] = useState<string>();

	const player = useAudioPlayer(null);
	const status = useAudioPlayerStatus(player);

	const isPlayingRef = useRef(false);
	const currentIndexRef = useRef(0);

	useEffect(() => {
		isPlayingRef.current = status.playing;
	}, [status.playing]);

	useEffect(() => {
		currentIndexRef.current = currentIndex;
	}, [currentIndex]);

	useEffect(() => {
		setAudioModeAsync({
			playsInSilentMode: true,
			interruptionMode: "duckOthers",
		});
	}, []);

	// Deferred play: wait for player to be loaded before playing
	useEffect(() => {
		if (wantsToPlay && status.isLoaded && !status.playing) {
			player.play();
			setWantsToPlay(false);
		}
	}, [wantsToPlay, status.isLoaded, status.playing, player, queue]);

	const resolveAndLoad = useCallback(
		async (track: Track, autoPlay: boolean) => {
			let streamUri = track.uri;

			if (!streamUri && track.tidalId) {
				setIsLoading(true);
				try {
					streamUri = await getTrackStream(track.tidalId);
				} catch {
					setIsLoading(false);
					return;
				}
			}

			if (!streamUri) {
				setIsLoading(false);
				return;
			}

			try {
				player.replace({ uri: streamUri });
				if (autoPlay) {
					setWantsToPlay(true);
				}
			} catch (e) {
				console.warn("Failed to load audio:", e);
			} finally {
				setIsLoading(false);
			}
		},
		[player],
	);

	const replaceQueue = async (tracks: Track[], currentListId: string) => {
		setQueue(tracks);
		setCurrentIndex(0);
		setCurrentListId(currentListId);

		if (tracks.length > 0) {
			await resolveAndLoad(tracks[0], true);
		}
	};

	const enQueue = async (track: Track) => {
		setQueue((prev) => [...prev, track]);
		setCurrentIndex(queue.length);
		setCurrentListId(undefined);
		await resolveAndLoad(track, true);
	};

	const loadSoundAt = useCallback(
		async (index: number, autoPlay = false) => {
			await resolveAndLoad(queue[index], autoPlay);
		},
		[queue, resolveAndLoad],
	);

	// Auto-advance when track finishes
	useEffect(() => {
		const subscription = player.addListener("playbackStatusUpdate", (s) => {
			if (s.playbackState === "ended" && queue.length > 0) {
				const nextIndex = (currentIndexRef.current + 1) % queue.length;
				setCurrentIndex(nextIndex);
				loadSoundAt(nextIndex, true);
			}
		});
		return () => subscription.remove();
	}, [player, queue.length, loadSoundAt]);

	useEffect(() => {
		if (queue.length > 0) {
			loadSoundAt(0, false);
		}
	}, []);

	const play = useCallback(async () => {
		if (status.isLoaded) {
			player.play();
		} else {
			setWantsToPlay(true);
		}
	}, [player, status.isLoaded]);

	const pause = useCallback(async () => {
		setWantsToPlay(false);
		player.pause();
	}, [player]);

	const next = useCallback(async () => {
		const nextIndex = (currentIndexRef.current + 1) % queue.length;
		setCurrentIndex(nextIndex);
		await loadSoundAt(nextIndex, isPlayingRef.current);
	}, [queue.length, loadSoundAt]);

	const previous = useCallback(async () => {
		if (status.currentTime > 3) {
			player.seekTo(0);
			return;
		}
		const prevIndex = (currentIndexRef.current - 1 + queue.length) % queue.length;
		setCurrentIndex(prevIndex);
		await loadSoundAt(prevIndex, isPlayingRef.current);
	}, [status.currentTime, queue.length, loadSoundAt, player]);

	const seek = useCallback(
		async (positionSeconds: number) => {
			if (!Number.isFinite(positionSeconds) || positionSeconds < 0) return;
			player.seekTo(positionSeconds);
		},
		[player],
	);

	const loadTrack = useCallback(
		async (track: Track) => {
			const index = queue.findIndex((t) => t.id === track.id);
			const targetIndex = index >= 0 ? index : 0;
			setCurrentIndex(targetIndex);
			await loadSoundAt(targetIndex, true);
		},
		[queue, loadSoundAt],
	);

	return (
		<PlayerContext.Provider
			value={{
				currentIndex,
				currentTrack: queue[currentIndex] ?? null,
				isPlaying: status.playing,
				isLoading,
				position: status.currentTime,
				duration: status.duration,
				queue,
				currentListId,
				replaceQueue,
				play,
				pause,
				next,
				previous,
				seek,
				loadTrack,
				enQueue,
			}}
		>
			{children}
		</PlayerContext.Provider>
	);
}

export function usePlayer() {
	const ctx = useContext(PlayerContext);
	if (!ctx) throw new Error("usePlayer must be used within <PlayerProvider>");
	return ctx;
}
