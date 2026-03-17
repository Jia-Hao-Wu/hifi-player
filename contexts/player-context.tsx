import {
	useAudioPlaylist,
	useAudioPlaylistStatus,
	setAudioModeAsync
} from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const STORAGE_KEY = "player_state";

interface SavedState {
	tracks: Track[];
	currentIndex: number;
	position: number;
	currentListId?: string;
}

async function resolveUri(track: Track): Promise<string | null> {
	if (track.uri) return track.uri;
	if (track.tidalId) {
		try {
			return await getTrackStream(track.tidalId);
		} catch {
		}
	}
	return null;
}

interface PlayerContextType {
	currentIndex: number;
	currentTrack: Track | null;
	isPlaying: boolean;
	isLoading: boolean;
	position: number;
	duration: number;
	length: number;
	currentListId?: string;
	replaceQueue: (tracks: Track[], currentListId: string) => Promise<void>;
	enQueue: (track: Track) => Promise<void>;
	play: () => Promise<void>;
	pause: () => Promise<void>;
	next: () => Promise<void>;
	previous: () => Promise<void>;
	seek: (positionSeconds: number) => Promise<void>;
	toggleLoop: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(false);
	const [currentListId, setCurrentListId] = useState<string>();
	const [trackList, setTrackList] = useState<Track[]>([]);
	const resolvedUpTo = useRef(-1);
	const trackListRef = useRef<Track[]>([]);
	const queueGeneration = useRef(0);
	const restoredRef = useRef(false);

	const playlist = useAudioPlaylist({ loop: "none" });
	const status = useAudioPlaylistStatus(playlist);

	useEffect(() => {
		setAudioModeAsync({
			playsInSilentMode: true,
			shouldPlayInBackground: true,
			interruptionMode: "duckOthers",
		});
	}, []);

	// Save state when track or position changes
	useEffect(() => {
		if (!restoredRef.current) return;
		if (trackListRef.current.length === 0) return;

		const state: SavedState = {
			tracks: trackListRef.current,
			currentIndex: status.currentIndex,
			position: status.currentTime,
			currentListId,
		};
		
		AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}, [status.currentIndex, Math.floor(status.currentTime / 5), currentListId]);

	// Restore state on mount
	useEffect(() => {
		(async () => {
			try {
				const raw = await AsyncStorage.getItem(STORAGE_KEY);
				
				if (!raw) return restoredRef.current = true;

				const saved: SavedState = JSON.parse(raw);

				if (!saved.tracks?.length) return restoredRef.current = true;

				const generation = ++queueGeneration.current;
				setTrackList(saved.tracks);
				trackListRef.current = saved.tracks;
				setCurrentListId(saved.currentListId);
				setIsLoading(true);

				// Resolve only the saved track so UI is available immediately
				const savedTrack = saved.tracks[saved.currentIndex];
				if (!savedTrack) { restoredRef.current = true; setIsLoading(false); return; }

				const uri = await resolveUri(savedTrack);
				if (!uri || generation !== queueGeneration.current) { restoredRef.current = true; setIsLoading(false); return; }

				playlist.add({ uri, name: savedTrack.title });
				resolvedUpTo.current = saved.currentIndex;

				if (saved.position > 0) await playlist.seekTo(saved.position);

				setIsLoading(false);
				restoredRef.current = true;

				// Resolve remaining tracks in the background (before and after saved index)
				await resolveAndAdd(saved.tracks, 0, saved.currentIndex - 1, generation);
				await resolveAndAdd(saved.tracks, saved.currentIndex + 1, saved.tracks.length - 1, generation);
			} catch {
				restoredRef.current = true;
				setIsLoading(false);
			}
		})();
	}, []);

	const resolveAndAdd = async (tracks: Track[], from: number, to: number, generation: number) => {
		for (let i = from; i <= to && i < tracks.length; i++) {
			if (generation !== queueGeneration.current) return;
			if (i <= resolvedUpTo.current) continue;
			const uri = await resolveUri(tracks[i]);
			if (uri && generation === queueGeneration.current) {
				playlist.add({ uri, name: tracks[i].title });
				resolvedUpTo.current = i;
			}
		}
	};

	const replaceQueue = async (tracks: Track[], listId: string) => {
		
		if (currentListId === listId) {
			return playlist.playing ? playlist.pause() : playlist.play();
		}

		const generation = ++queueGeneration.current;
		restoredRef.current = true;
		setCurrentListId(listId);
		setIsLoading(true);
		playlist.clear();
		resolvedUpTo.current = -1;
		setTrackList(tracks);
		trackListRef.current = tracks;

		if (tracks.length === 0) {
			setIsLoading(false);
			return;
		}

		// Resolve the first track and start playing immediately
		const firstUri = await resolveUri(tracks[0]);
		if (!firstUri) {
			setIsLoading(false);
			return;
		}

		playlist.add({ uri: firstUri, name: tracks[0].title });
		resolvedUpTo.current = 0;
		playlist.play();
		setIsLoading(false);

		// Resolve remaining tracks in the background
		await resolveAndAdd(tracks, 1, tracks.length - 1, generation);
	};

	const enQueue = async (track: Track) => {
		const currentTrack = trackList[status.currentIndex] ?? null;

		if (track.id === currentTrack?.id) {
			return playlist.playing ? playlist.pause() : playlist.play();
		}

		const uri = await resolveUri(track);
		if (!uri) return;

		// Cancel any in-flight background resolution from replaceQueue
		++queueGeneration.current;
		restoredRef.current = true;

		// Remove existing duplicate from the playlist if present
		const existingIndex = trackListRef.current
			.slice(0, playlist.trackCount)
			.findIndex((t) => t.id === track.id);

		if (existingIndex !== -1) playlist.remove(existingIndex);

		const newIndex = playlist.trackCount;
		setCurrentListId(undefined);

		setTrackList((prev) => {
			const truncated = prev.slice(0, existingIndex !== -1 ? playlist.trackCount : newIndex);
			const filtered = truncated.filter((t) => t.id !== track.id);
			const next = [...filtered, track];
			trackListRef.current = next;
			return next;
		});

		resolvedUpTo.current = playlist.trackCount;

		playlist.add({ uri, name: track.title });
		playlist.skipTo(playlist.trackCount - 1);
		playlist.pause();
	};

	const play = useCallback(async () => {
		playlist.play();
	}, [playlist]);

	const pause = useCallback(async () => {
		playlist.pause();
	}, [playlist]);

	const next = useCallback(async () => {
		playlist.next();
	}, [playlist]);

	const previous = useCallback(async () => {
		if (playlist.currentTime > 3) {
			await playlist.seekTo(0);
			return;
		}
		playlist.previous();
	}, [playlist]);

	const seek = useCallback(
		async (positionSeconds: number) => {
			if (!Number.isFinite(positionSeconds) || positionSeconds < 0) return;
			await playlist.seekTo(positionSeconds);
		},
		[playlist],
	);

	const toggleLoop = useCallback(() => {
		playlist.loop = playlist.loop === "none" ? "all" : "none";
	}, [playlist]);


	return (
		<PlayerContext.Provider
			value={{
				currentIndex: status.currentIndex,
				currentTrack: trackList[status.currentIndex] ?? null,
				isPlaying: status.playing,
				isLoading: isLoading || status.isBuffering,
				position: status.currentTime,
				duration: status.duration,
				length: trackList.length,
				currentListId,
				replaceQueue,
				play,
				pause,
				next,
				previous,
				seek,
				enQueue,
				toggleLoop
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
