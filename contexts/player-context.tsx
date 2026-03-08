import { Audio, AVPlaybackStatus } from "expo-av";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

import { Track, TRACKS } from "@/constants/tracks";

interface PlayerContextType {
	currentTrack: Track | null;
	isPlaying: boolean;
	position: number;
	duration: number;
	queue: Track[];
	play: () => Promise<void>;
	pause: () => Promise<void>;
	next: () => Promise<void>;
	previous: () => Promise<void>;
	seek: (positionSeconds: number) => Promise<void>;
	loadTrack: (track: Track) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
	const [queue] = useState<Track[]>(TRACKS);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [position, setPosition] = useState(0);
	const [duration, setDuration] = useState(0);

	const soundRef = useRef<Audio.Sound | null>(null);
	const isPlayingRef = useRef(false);
	const currentIndexRef = useRef(0);

	useEffect(() => {
		isPlayingRef.current = isPlaying;
	}, [isPlaying]);

	useEffect(() => {
		currentIndexRef.current = currentIndex;
	}, [currentIndex]);

	useEffect(() => {
		Audio.setAudioModeAsync({
			allowsRecordingIOS: false,
			staysActiveInBackground: true,
			playsInSilentModeIOS: true,
			shouldDuckAndroid: true,
		});
	}, []);

	useEffect(() => {
		if (queue.length > 0) {
			loadSoundAt(0, false);
		}
		return () => {
			soundRef.current?.unloadAsync();
		};
	}, []);

	const onPlaybackStatusUpdate = useCallback(
		(status: AVPlaybackStatus) => {
			if (!status.isLoaded) return;
			setPosition((status.positionMillis ?? 0) / 1000);
			if (Number.isFinite(status.durationMillis)) {
				setDuration((status.durationMillis as number) / 1000);
			}
			setIsPlaying(status.isPlaying);

			if (status.didJustFinish) {
				const nextIndex = (currentIndexRef.current + 1) % queue.length;
				setCurrentIndex(nextIndex);
				loadSoundAt(nextIndex, true);
			}
		},
		[queue.length],
	);

	const loadSoundAt = useCallback(
		async (index: number, autoPlay = false) => {
			if (soundRef.current) {
				await soundRef.current.unloadAsync();
				soundRef.current = null;
			}

			setPosition(0);
			setDuration(0);

			try {
				const { sound } = await Audio.Sound.createAsync(
					{ uri: queue[index].uri },
					{ shouldPlay: autoPlay },
					onPlaybackStatusUpdate,
				);

				soundRef.current = sound;

				const status = await sound.getStatusAsync();
				if (status.isLoaded && Number.isFinite(status.durationMillis)) {
					setDuration((status.durationMillis as number) / 1000);
				}
			} catch (e) {
				console.warn("Failed to load audio:", e);
			}
		},
		[queue, onPlaybackStatusUpdate],
	);

	const play = useCallback(async () => {
		await soundRef.current?.playAsync();
	}, []);

	const pause = useCallback(async () => {
		await soundRef.current?.pauseAsync();
	}, []);

	const next = useCallback(async () => {
		const nextIndex = (currentIndexRef.current + 1) % queue.length;
		setCurrentIndex(nextIndex);
		await loadSoundAt(nextIndex, isPlayingRef.current);
	}, [queue.length, loadSoundAt]);

	const previous = useCallback(async () => {
		if (position > 3) {
			await soundRef.current?.setPositionAsync(0);
			return;
		}
		const prevIndex = (currentIndexRef.current - 1 + queue.length) % queue.length;
		setCurrentIndex(prevIndex);
		await loadSoundAt(prevIndex, isPlayingRef.current);
	}, [position, queue.length, loadSoundAt]);

	const seek = useCallback(async (positionSeconds: number) => {
		await soundRef.current?.setPositionAsync(positionSeconds * 1000);
	}, []);

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
				isPlaying,
				position,
				duration,
				queue,
				play,
				pause,
				next,
				previous,
				seek,
				loadTrack,
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
