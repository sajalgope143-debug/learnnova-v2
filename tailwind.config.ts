import type { Config } from "tailwindcss";

// LearnSphere design system — a distinct brand identity:
// deep indigo + amber accent, not a copy of any existing ed-tech site.
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f1ff",
          100: "#e6e4ff",
          200: "#cec9ff",
          300: "#a7a1ff",
          400: "#8a80ff",
          500: "#6d5efc", // primary
          600: "#5744e0",
          700: "#4433b8",
          800: "#352994",
          900: "#2a2176",
          950: "#181254",
        },
        accent: {
          50: "#fff8e6",
          100: "#ffedbf",
          200: "#ffdd85",
          300: "#ffc94a",
          400: "#ffb81f", // amber accent
          500: "#f59e00",
          600: "#cc7e00",
          700: "#995f00",
          800: "#664000",
          900: "#332000",
        },
        surface: {
          light: "#ffffff",
          subtle: "#f7f7fb",
          dark: "#0f0f17",
          "dark-subtle": "#17172447",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(109, 94, 252, 0.5)",
        card: "0 2px 8px rgba(15, 15, 23, 0.06)",
        "card-dark": "0 2px 8px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
