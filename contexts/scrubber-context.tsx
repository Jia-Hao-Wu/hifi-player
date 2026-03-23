import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

import { usePlayer } from "@/contexts/player-context";
import { MinMax } from "@/utils";

interface ScrubberContextType {
	displayProgress: number;
	displayPosition: number;
	isScrubbing: boolean;
	startScrub: (ratio: number) => void;
	moveScrub: (startRatio: number, dx: number, barWidth: number) => void;
	endScrub: (startRatio: number, dx: number, barWidth: number) => void;
	cancelScrub: () => void;
}

const ScrubberContext = createContext<ScrubberContextType | null>(null);

export function ScrubberProvider({ children }: { children: React.ReactNode }) {
	const { position, duration, seek } = usePlayer();

	const [isScrubbing, setIsScrubbing] = useState(false);
	const [scrubRatio, setScrubRatio] = useState(0);
	const [seekTarget, setSeekTarget] = useState<number | null>(null);

	const durationRef = useRef(duration);
	const seekRef = useRef(seek);
	const scrubRatioRef = useRef(0);

	durationRef.current = duration;
	seekRef.current = seek;

	useEffect(() => {
		if (seekTarget !== null && Math.abs(position - seekTarget) < 0.5) {
			setSeekTarget(null);
		}
	}, [position, seekTarget]);

	const progress = duration > 0 ? position / duration : 0;
	const displayProgress = isScrubbing
		? scrubRatio
		: seekTarget !== null && duration > 0
			? seekTarget / duration
			: progress;
	const displayPosition = isScrubbing
		? scrubRatio * duration
		: seekTarget ?? position;

	const startScrub = (ratio: number) => {
		setSeekTarget(null);
		scrubRatioRef.current = ratio;
		setIsScrubbing(true);
		setScrubRatio(ratio);
	};

	const moveScrub = (startRatio: number, dx: number, barWidth: number) => {
		if (!barWidth) return;
		const ratio = MinMax(0, 1, startRatio + dx / barWidth);
		scrubRatioRef.current = ratio;
		setScrubRatio(ratio);
	};

	const endScrub = (startRatio: number, dx: number, barWidth: number) => {
		if (!barWidth || !durationRef.current) return;
		const ratio = MinMax(0, 1, startRatio + dx / barWidth);
		const target = ratio * durationRef.current;
		setSeekTarget(target);
		setIsScrubbing(false);
		seekRef.current(target);
	};

	const cancelScrub = () => {
		if (durationRef.current) {
			const target = scrubRatioRef.current * durationRef.current;
			setSeekTarget(target);
			seekRef.current(target);
		}
		setIsScrubbing(false);
	};

	return (
		<ScrubberContext.Provider
			value={{
				displayProgress,
				displayPosition,
				isScrubbing,
				startScrub,
				moveScrub,
				endScrub,
				cancelScrub,
			}}
		>
			{children}
		</ScrubberContext.Provider>
	);
}

export function useScrubber() {
	const ctx = useContext(ScrubberContext);
	if (!ctx) throw new Error("useScrubber must be used within <ScrubberProvider>");
	return ctx;
}
