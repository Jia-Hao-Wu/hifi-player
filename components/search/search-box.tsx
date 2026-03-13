import { TextInput, type TextInputProps, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

type SearchboxProps = Omit<TextInputProps, "style">;

export function Searchbox(props: SearchboxProps) {
	return (
		<View className="relative">
			<TextInput
				className="bg-player-surface rounded-md px-3 py-2 w-full text-sm text-foreground"
				placeholderTextColor="var(--color-muted)"
				{...props}
			/>
			<IconSymbol
				className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-25"
				size={28}
				name="magnifyingglass"
				color="var(--color-foreground)"
			/>
		</View>
	);
}
