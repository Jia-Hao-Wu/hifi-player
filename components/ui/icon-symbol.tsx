import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue } from "react-native";

type IconMapping = Record<
	// @ts-ignore
	SymbolViewProps["name"],
	ComponentProps<typeof MaterialIcons>["name"]
>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
	"house.fill": "home",
	"paperplane.fill": "send",
	"chevron.left.forwardslash.chevron.right": "code",
	"chevron.right": "chevron-right",
	"chevron.left": "chevron-left",
	"play.fill": "play-arrow",
	"pause.fill": "pause",
	"forward.fill": "skip-next",
	"backward.fill": "skip-previous",
	"magnifyingglass": "search",
	"list.bullet": "queue-music",
	"chevron.up": "expand-less",
	"chevron.down": "expand-more",
	"xmark": "close",
	"line.3.horizontal": "drag-handle",
	"music.note.list": "library-music",
	"shuffle": "shuffle",
	"plus": "add",
	"trash": "delete",
	"heart": "favorite-outline",
	"heart.fill": "favorite",
	"heart.slash": "dnd-forwardslash"
} as IconMapping;


export function IconSymbol({
	name,
	size = 24,
	color,
	className,
}: {
	name: IconSymbolName;
	size?: number;
	color?: string | OpaqueColorValue;
	className?: string;
	weight?: SymbolWeight;
}) {
	return (
		<MaterialIcons {...(color ? { color } : {})} size={size} name={MAPPING[name]} className={className} />
	);
}
