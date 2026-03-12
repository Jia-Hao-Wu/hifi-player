import { useState } from "react";

type Tab = {
	label: string;
	content: React.ReactNode;
};

type TabsProps = {
	tabs: Tab[];
	defaultIndex?: number;
};

export function Tabs({ tabs, defaultIndex = 0 }: TabsProps) {
	const [activeIndex, setActiveIndex] = useState(defaultIndex);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="flex gap-1 border-b border-foreground/10 justify-evenly">
				{tabs.map((tab, index) => (
					<button
						key={tab.label}
						onClick={() => setActiveIndex(index)}
						className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
							index === activeIndex
								? "border-foreground text-foreground"
								: "border-transparent text-muted"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto pt-4">{tabs[activeIndex]?.content}</div>
		</div>
	);
}
