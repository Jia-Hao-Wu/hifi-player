import { IconSymbol } from "@/components/ui/icon-symbol";

export function Searchbox({ ...props }: React.ComponentPropsWithoutRef<"input">) {
	return (
		<div className="relative">
			<input
				className="bg-player-surface focus:outline-none dark:focus:bg-white/10 focus:bg-black/10 rounded-md px-3 py-2 w-full text-sm transition-colors duration-200 text-foreground"
				{...props}
			/>
			<IconSymbol
				className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-25"
				size={28}
				name="magnifyingglass"
				color="var(--color-foreground)"
			/>
		</div>
	);
}
