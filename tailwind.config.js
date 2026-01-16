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
