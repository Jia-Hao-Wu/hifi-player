import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import type { TextProps } from "react-native";

type MarqueeTextProps = Omit<TextProps, "children"> & {
	text: string;
};

export function MarqueeText({ text, className, ...textProps }: MarqueeTextProps) {
	const translateX = useRef(new Animated.Value(0)).current;
	const animRef = useRef<Animated.CompositeAnimation | null>(null);
	const shouldScroll = text.length > 19;

	useEffect(() => {
		animRef.current?.stop();
		translateX.setValue(0);

		if (!shouldScroll) return;

		const distance = (text.length - 19) * 8;

		const loop = () => {
			animRef.current = Animated.sequence([
				Animated.delay(2000),
				Animated.timing(translateX, {
					toValue: -distance,
					duration: distance * 40,
					useNativeDriver: true,
				}),
				Animated.delay(2000),
				Animated.timing(translateX, {
					toValue: 0,
					duration: distance * 40,
					useNativeDriver: true,
				}),
			]);
			animRef.current.start(({ finished }) => {
				if (finished) loop();
			});
		};

		loop();
		return () => animRef.current?.stop();
	}, [text, shouldScroll, translateX]);

	if (!shouldScroll) {
		return (
			<Animated.Text {...textProps} className={className} numberOfLines={1}>
				{text}
			</Animated.Text>
		);
	}

	return (
		<View className="overflow-hidden">
			<Animated.Text
				{...textProps}
				className={className}
				style={{ width: "200%", transform: [{ translateX }] }}
			>
				{text}
			</Animated.Text>
		</View>
	);
}
