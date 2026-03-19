/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	// NOTE: Update this to include the paths to all files that contain Nativewind classes.
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				foreground: "var(--color-foreground)",
				background: "var(--color-background)",
				muted: "var(--color-muted)",
				"player-surface": "var(--color-player-surface)",
				"player-border": "var(--color-player-border)",
				accent: "var(--color-accent)",
				"accent-2": "var(--color-accent-2)",
			},
		},
	},
	plugins: [
		({ addBase }: { addBase: Function }) =>
			addBase({
				":root": {
					"--color-foreground": "#000",
					"--color-background": "#fff",
					"--color-muted": "#adadad",
					"--color-player-surface": "#f5f5f5",
					"--color-player-border": "#e5e5e5",
					"--color-accent": "#86ff9633",
					"--color-accent-2": "rgba(231, 91, 91, 0.075)",
				},
			}),
	],
};
