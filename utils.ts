function MinMax(min: number, max: number, value: number) {
	return Math.max(min, Math.min(max, value));
}

function isSet(value: unknown) {
	return isNaN(value as number) || value === null || value === undefined;
}

function formatTime(seconds: number) {
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

export { MinMax, isSet, formatTime };
