const FALLBACK_INSTANCES: string[] = [
	"https://eu-central.monochrome.tf",
	"https://arran.monochrome.tf",
	"https://us-west.monochrome.tf",
	"https://api.monochrome.tf",
	"https://monochrome-api.samidy.com",
	"https://triton.squid.wtf",
];

const UPTIME_URL = "https://tidal-uptime.jiffy-puffs-1j.workers.dev/";
const INSTANCE_CACHE_TTL = 15 * 60 * 1000;
const INSTANCE_COOLDOWN_MS = 60 * 1000;

let cachedInstances: string[] = FALLBACK_INSTANCES;
let cacheExpiresAt = 0;

const cooldowns = new Map<string, number>();

export async function refreshInstances(): Promise<void> {
	if (Date.now() < cacheExpiresAt) return;

	try {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 4_000);

		const res = await fetch(UPTIME_URL, { signal: controller.signal });
		clearTimeout(timer);

		const data = await res.json();
		const discovered: string[] = (data?.api ?? [])
			.map((entry: any) => entry?.url as string)
			.filter((url: string) => typeof url === "string" && url.startsWith("http"));

		if (discovered.length > 0) {
			cachedInstances = discovered;
		}
	} catch {}

	cacheExpiresAt = Date.now() + INSTANCE_CACHE_TTL;
}

export function markFailed(baseUrl: string): void {
	cooldowns.set(baseUrl, Date.now() + INSTANCE_COOLDOWN_MS);
}

export function pickInstance(): string {
	const now = Date.now();
	const available = cachedInstances.filter(
		(url) => !cooldowns.has(url) || cooldowns.get(url)! < now,
	);

	const pool = available.length > 0 ? available : cachedInstances;
	return pool[Math.floor(Math.random() * pool.length)];
}
