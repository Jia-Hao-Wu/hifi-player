/**
 * Core HTTP client for the Monochrome API.
 * Implements instance failover: on 429 or 5xx the failing instance is
 * marked as temporarily unavailable and the request is retried against
 * a different one up to MAX_RETRIES times.
 */

import { markFailed, pickInstance, refreshInstances } from "./instances";

const MAX_RETRIES = 3;

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		message: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

/**
 * Perform a GET request against the Monochrome API.
 *
 * @param path    Path + query string, e.g. `/search/?s=radiohead`
 * @param signal  Optional AbortSignal for request cancellation
 */
export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
	// Best-effort instance refresh (no-op if cache is still fresh)
	await refreshInstances();

	let lastError: Error = new ApiError(0, "No instances available");

	for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
		if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

		const base = pickInstance();
		const url = `${base}${path}`;

		try {
			const res = await fetch(url, {
				signal,
				headers: { Accept: "application/json" },
			});

			// Retriable server-side errors → blacklist instance and try another
			if (res.status === 429 || res.status >= 500) {
				markFailed(base);
				lastError = new ApiError(res.status, `${res.status} from ${base}`);
				continue;
			}

			if (!res.ok) {
				throw new ApiError(res.status, `HTTP ${res.status} from ${base}`);
			}

			return res.json() as Promise<T>;
		} catch (err) {
			if (signal?.aborted) throw err;
			// Network error (no connectivity, DNS failure, etc.)
			markFailed(base);
			lastError = err instanceof Error ? err : new Error(String(err));
		}
	}

	throw lastError;
}
