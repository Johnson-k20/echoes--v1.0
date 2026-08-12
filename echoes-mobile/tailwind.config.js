const { themeColors } = require("./theme.config");

const tailwindColors = Object.fromEntries(
  Object.entries(themeColors).map(([name, swatch]) => [
    name,
    {
      DEFAULT: swatch.dark,
      light: swatch.light,
      dark: swatch.dark,
    },
  ]),
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,tsx}",
    "./components/**/*.{js,ts,tsx}",
    "./lib/**/*.{js,ts,tsx}",
    "./constants/**/*.{js,ts}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: tailwindColors,
      fontFamily: {
        serif: ["CormorantGaramond", "System"],
        sans: ["Inter", "System"],
      },
    },
  },
  plugins: [],
};
