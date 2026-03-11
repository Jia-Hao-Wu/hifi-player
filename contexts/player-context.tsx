import {
	useAudioPlayer,
	useAudioPlayerStatus,
	setAudioModeAsync,
} from "expo-audio";

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
	currentTrack: Track | null;
	isPlaying: boolean;
	isLoading: boolean;
	position: number;
	duration: number;
	queue: Track[];
	setQueue: (tracks: Track[]) => void;
	enQueue: (track: Track) => void;
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

	const enQueue = (track: Track) => {
		setQueue((prev) => [...prev, track]);
	};

	const loadSoundAt = useCallback(
		async (index: number, autoPlay = false) => {
			const track = queue[index];
			let streamUri = track.uri;

			if (!streamUri && track.tidalId) {
				setIsLoading(true);
				try {
					streamUri = await getTrackStream(track.tidalId);
				} catch (e) {
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
					player.play();
				}
			} catch (e) {
				console.warn("Failed to load audio:", e);
			} finally {
				setIsLoading(false);
			}
		},
		[queue, player],
	);

	// Auto-advance when track finishes
	useEffect(() => {
		const subscription = player.addListener(
			"playbackStatusUpdate",
			(s) => {
				if (s.playbackState === "ended" && queue.length > 0) {
					const nextIndex =
						(currentIndexRef.current + 1) % queue.length;
					setCurrentIndex(nextIndex);
					loadSoundAt(nextIndex, true);
				}
			},
		);
		return () => subscription.remove();
	}, [player, queue.length, loadSoundAt]);

	useEffect(() => {
		if (queue.length > 0) {
			loadSoundAt(0, false);
		}
	}, []);

	const play = useCallback(async () => {
		player.play();
	}, [player]);

	const pause = useCallback(async () => {
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
		const prevIndex =
			(currentIndexRef.current - 1 + queue.length) % queue.length;
		setCurrentIndex(prevIndex);
		await loadSoundAt(prevIndex, isPlayingRef.current);
	}, [status.currentTime, queue.length, loadSoundAt, player]);

	const seek = useCallback(
		async (positionSeconds: number) => {
			if (!Number.isFinite(positionSeconds) || positionSeconds < 0)
				return;
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
				currentTrack: queue[currentIndex] ?? null,
				isPlaying: status.playing,
				isLoading,
				position: status.currentTime,
				duration: status.duration,
				queue,
				setQueue,
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
