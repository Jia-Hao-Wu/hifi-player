import { View, type ViewProps } from "react-native";

export function ThemedView({ className, ...props }: ViewProps & { className?: string }) {
	return <View className={`bg-background ${className ?? ""}`} {...props} />;
}
