import Reactotron from "reactotron-react-native";

Reactotron.configure({
	name: "HiFi Music Player",
})
	.useReactNative({
		networking: {
			ignoreUrls: /symbolicate/,
		},
		errors: { veto: () => false },
	})
	.connect();

console.tron = Reactotron;
