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
import {
	updateNowPlaying,
	updatePlaybackState,
	addMediaControlListener,
	stop as stopMediaControls,
} from "@/modules/media-controls";

const STORAGE_KEY = "player_state";

interface SavedState {
	tracks: Track[];
	currentIndex: number;
	position: number;
	currentListId?: string;
}

function isUriExpired(uri: string): boolean {
	try {
		const token = new URL(uri).searchParams.get("token");
		if (!token) return true;
		const epoch = Number(token.split("~")[0]);
		if (!epoch) return true;
		return Date.now() / 1000 >= epoch;
	} catch {
		return true;
	}
}

async function resolveUri(track: Track): Promise<string | null> {
	if (track.uri && !isUriExpired(track.uri)) return track.uri;
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
	looping: boolean;
	toggleLoop: () => void;
	shuffled: boolean;
	toggleShuffle: () => void;
	trackList: Track[];
	moveTrack: (fromIndex: number, toIndex: number) => Promise<void>;
	removeTrack: (index: number) => void;
	jumpTo: (index: number) => void;
	clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(false);
	const [currentListId, setCurrentListId] = useState<string>();
	const [trackList, setTrackList] = useState<Track[]>([]);
	const [shuffled, setShuffled] = useState(false);
	const [looping, setLooping] = useState(false);
	const resolvedUris = useRef(new Map<string, string>());
	const trackListRef = useRef<Track[]>([]);
	const queueGeneration = useRef(0);
	const restoredRef = useRef(false);

	const playlist = useAudioPlaylist({ loop: "none" });
	const status = useAudioPlaylistStatus(playlist);

	useEffect(() => {
		setAudioModeAsync({
			playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
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

				if (!savedTrack) {
					 restoredRef.current = true; 
					 setIsLoading(false); 
					 return; 
				}

				const uri = await resolveUri(savedTrack);

				if (!uri || generation !== queueGeneration.current) {
					restoredRef.current = true;
					setIsLoading(false); 
					return; 
				}

				resolvedUris.current.set(savedTrack.id, uri);
				playlist.add({ uri, name: savedTrack.title });

				if (saved.position > 0) await playlist.seekTo(saved.position);

				setIsLoading(false);
				restoredRef.current = true;

				// Resolve remaining tracks in the background (after saved index first, then before)
				await resolveAndAdd(saved.tracks, saved.currentIndex + 1, saved.tracks.length - 1, generation);
				await resolveAndAdd(saved.tracks, 0, saved.currentIndex - 1, generation);
				
			} catch (error) {
				console.error(error);
				restoredRef.current = true;
				setIsLoading(false);
			}
		})();
	}, []);

	const resolveAndAdd = async (tracks: Track[], from: number, to: number, generation: number) => {
		for (let i = from; i <= to && i < tracks.length; i++) {
			if (generation !== queueGeneration.current) return;
			if (resolvedUris.current.has(tracks[i].id)) continue;
			const uri = await resolveUri(tracks[i]);
			if (uri && generation === queueGeneration.current) {
				resolvedUris.current.set(tracks[i].id, uri);
				playlist.add({ uri, name: tracks[i].title });
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
		resolvedUris.current.clear();
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

		resolvedUris.current.set(tracks[0].id, firstUri);
		playlist.add({ uri: firstUri, name: tracks[0].title });
		playlist.play();
		setIsLoading(false);

		// Resolve remaining tracks in the background
		await resolveAndAdd(tracks, 1, tracks.length - 1, generation);
	};

	const enQueue = async (track: Track) => {
		const currentTrack = trackListRef.current[status.currentIndex] ?? null;

		if (track.id === currentTrack?.id) {
			return playlist.playing ? playlist.pause() : playlist.play();
		}

		// Use cached URI or resolve fresh
		let uri = resolvedUris.current.get(track.id);
		if (!uri) {
			const resolved = await resolveUri(track);
			if (!resolved) return;
			uri = resolved;
		}
		resolvedUris.current.set(track.id, uri);

		// Cancel any in-flight background resolution
		++queueGeneration.current;
		restoredRef.current = true;
		setCurrentListId(undefined);

		// Rebuild trackList with only resolved tracks (to stay in sync with
		// the audio playlist) and append the new track at the end.
		const next = [
			...trackListRef.current.filter(
				(t) => t.id !== track.id && resolvedUris.current.has(t.id),
			),
			track,
		];
		setTrackList(next);
		trackListRef.current = next;

		// Rebuild the audio playlist so indices match trackList exactly
		playlist.clear();
		for (const t of next) {
			const u = resolvedUris.current.get(t.id);
			if (u) playlist.add({ uri: u, name: t.title });
		}

		playlist.skipTo(next.length - 1);
		playlist.play();
	};

	const moveTrack = async (fromIndex: number, toIndex: number) => {
		if (fromIndex === toIndex) return;
		const prev = trackListRef.current;
		if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) return;

		++queueGeneration.current;

		const next = [...prev];
		const [moved] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, moved);

		const wasPlaying = status.playing;
		const currentTime = status.currentTime;
		const currentTrackId = prev[status.currentIndex]?.id;

		setTrackList(next);
		trackListRef.current = next;

		playlist.clear();
		for (const track of next) {
			const uri = resolvedUris.current.get(track.id);
			if (uri) playlist.add({ uri, name: track.title });
		}

		if (currentTrackId) {
			const newIndex = next.findIndex(t => t.id === currentTrackId);
			if (newIndex !== -1) {
				playlist.skipTo(newIndex);
				if (currentTime > 0) await playlist.seekTo(currentTime);
				if (wasPlaying) playlist.play();
			}
		}
	};

	const removeTrack = (index: number) => {
		const prev = trackListRef.current;
		if (index < 0 || index >= prev.length) return;

		const next = prev.filter((_, i) => i !== index);
		setTrackList(next);
		trackListRef.current = next;

		if (index < playlist.trackCount) {
			playlist.remove(index);
		}
	};

	const jumpTo = (index: number) => {
		if (index < 0 || index >= trackListRef.current.length) return;
		playlist.skipTo(index);
		playlist.play();
	};

	const clearQueue = () => {
		++queueGeneration.current;
		playlist.clear();
		resolvedUris.current.clear();
		setTrackList([]);
		trackListRef.current = [];
		setCurrentListId(undefined);
		stopMediaControls();
	};

	// Sync track metadata to lock screen notification
	const currentTrack = trackList[status.currentIndex] ?? null;
	useEffect(() => {
		if (!currentTrack) return;
		updateNowPlaying({
			title: currentTrack.title,
			artist: currentTrack.artist?.name ?? "Unknown Artist",
			album: currentTrack.album,
			artworkUrl: currentTrack.artwork,
			duration: status.duration,
		});
	}, [currentTrack?.id, status.duration]);

	// Sync playback state to lock screen notification
	useEffect(() => {
		if (!currentTrack) return;
		updatePlaybackState({
			isPlaying: status.playing,
			position: status.currentTime,
		});
	}, [status.playing, Math.floor(status.currentTime)]);

	// Handle lock screen / notification control events
	useEffect(() => {
		const sub = addMediaControlListener((event) => {
			switch (event.type) {
				case "play":
					playlist.play();
					break;
				case "pause":
					playlist.pause();
					break;
				case "next":
					if (shuffled && trackListRef.current.length > 1) {
						let rand: number;
						do {
							rand = Math.floor(Math.random() * trackListRef.current.length);
						} while (rand === status.currentIndex);
						playlist.skipTo(rand);
					} else {
						playlist.next();
					}
					break;
				case "previous":
					if (playlist.currentTime > 3) {
						playlist.seekTo(0);
					} else {
						playlist.previous();
					}
					break;
				case "seekTo":
					playlist.seekTo(event.position);
					break;
			}
		});
		return () => sub.remove();
	}, [playlist, shuffled, status.currentIndex]);

	const play = useCallback(async () => {
		playlist.play();
	}, [playlist]);

	const pause = useCallback(async () => {
		playlist.pause();
	}, [playlist]);

	const next = useCallback(async () => {
		if (shuffled && trackListRef.current.length > 1) {
			let rand: number;
			do {
				rand = Math.floor(Math.random() * trackListRef.current.length);
			} while (rand === status.currentIndex);
			playlist.skipTo(rand);
		} else {
			playlist.next();
		}
	}, [playlist, shuffled, status.currentIndex]);

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
		setLooping((prev) => {
			const next = prev ? "none" : "all";
			requestAnimationFrame(() => {
				playlist.loop = next;
			});
			return !prev;
		});
	}, [playlist]);

	const toggleShuffle = useCallback(() => {
		setShuffled((v) => !v);
	}, []);


	return (
		<PlayerContext.Provider
			value={{
				currentIndex: status.currentIndex,
				currentTrack,
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
				looping,
				toggleLoop,
				shuffled,
				toggleShuffle,
				trackList,
				moveTrack,
				removeTrack,
				jumpTo,
				clearQueue,
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
