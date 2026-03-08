/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all files that contain Nativewind classes.
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				foreground: "var(--color-foreground)",
				background: "var(--color-background)",
				tint: "var(--color-tint)",
				icon: "var(--color-icon)",
				"player-surface": "var(--color-player-surface)",
				"player-border": "var(--color-player-border)",
			},
		},
	},
	plugins: [],
};
