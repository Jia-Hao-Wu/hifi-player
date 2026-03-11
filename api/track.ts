import { apiGet } from "./client";
import { SearchResponse } from "./search";

export type StreamQuality = "HI_RES_LOSSLESS" | "HI_RES" | "LOSSLESS" | "HIGH" | "LOW";

const QUALITY_FALLBACK: StreamQuality[] = [
	"HI_RES_LOSSLESS",
	"HI_RES",
	"LOSSLESS",
	"HIGH",
	"LOW",
];

interface TrackStreamResponse {
	manifest: string;
	manifestHash: string;
	trackId: number;
	audioMode: string;
	audioQuality: string;
	assetPresentation: string;
	manifestMimeType: string;
	trackReplayGain?: number;
	trackPeakAmplitude: number;
	albumReplayGain: number;
	albumPeakAmplitude: number;
}

interface JsonManifest {
	mimeType?: string;
	codecs?: string;
	encryptionType?: string;
	urls?: string[];
}

/**
 * Attempt to extract a direct stream URL from a base64-encoded manifest.
 * Returns `null` if the manifest is a DASH XML (not usable in React Native).
 */
export function resolveStreamUrl(manifest: string): string | null {

	let decoded: string;
	try {
		decoded = atob(manifest);
	} catch {
		if (manifest.startsWith("http")) return manifest.trim();
		return null;
	}

	if (decoded.trimStart().startsWith("<")) return null;

	try {
		const json: JsonManifest = JSON.parse(decoded);
		const url = json.urls?.[0];
		if (url) return url;
	} catch {
		if (decoded.startsWith("http")) return decoded.trim();
	}

	return null;
}

/**
 * Fetch a playable stream URL for the given TIDAL track ID.
 * Tries qualities from best to worst until a non-DASH URL is returned.
 */
export async function getTrackStream(
	id: string,
	quality: StreamQuality = "HI_RES_LOSSLESS",
	signal?: AbortSignal,
): Promise<string> {
	const qualityIndex = QUALITY_FALLBACK.indexOf(quality);
	const qualitiesToTry = QUALITY_FALLBACK.slice(qualityIndex);

	for (const q of qualitiesToTry) {
		const qs = new URLSearchParams({ id, quality: q });
		const { data } = await apiGet<SearchResponse<TrackStreamResponse>>(`/track/?${qs}`, signal);

		const url = resolveStreamUrl(data.manifest ?? "");

		console.log(url);

		if (url) return url;
	}

	throw new Error(`No playable stream found for track ${id}`);
}
