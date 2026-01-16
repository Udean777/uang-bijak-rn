/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#6B7280",
        success: "#16A34A",
        danger: "#DC2626",
        warning: "#F59E0B",
        surface: "#F9FAFB",
      },
      fontFamily: {
        jakarta: ["JakartaSans"],
        jakartaMedium: ["JakartaSansMedium"],
        jakartaSemiBold: ["JakartaSansSemiBold"],
        jakartaBold: ["JakartaSansBold"],
        jakartaExtraBold: ["JakartaSansExtraBold"],
        jakartaLight: ["JakartaSansLight"],
      },
    },
  },
  plugins: [],
};
