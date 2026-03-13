function MinMax(min: number, max: number, value: number) {
	return Math.max(min, Math.min(max, value));
}

function isSet(value: unknown) {
	return isNaN(value as number) || value === null || value === undefined;
}

export { MinMax, isSet };
