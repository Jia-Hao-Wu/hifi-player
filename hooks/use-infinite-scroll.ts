import { useEffect, useRef } from "react";

export function useInfiniteScroll(
	onLoadMore: () => void,
	enabled: boolean,
) {
	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = sentinelRef.current;
		if (!el || !enabled) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					onLoadMore();
				}
			},
			{ threshold: 0 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [onLoadMore, enabled]);

	return sentinelRef;
}
