import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff4ed",
          100: "#ffe4d3",
          200: "#ffc6a6",
          300: "#ff9f6e",
          400: "#ff6f33",
          500: "#f7480d",
          600: "#e12f06",
          700: "#ba2108",
          800: "#941c0e",
          900: "#791b0f",
          950: "#420a04",
        },
        ink: {
          50: "#f6f7f8",
          100: "#eceef1",
          200: "#d5dae0",
          300: "#b0b9c4",
          400: "#8493a3",
          500: "#647588",
          600: "#4f5d6e",
          700: "#414c5a",
          800: "#38414c",
          900: "#232830",
          950: "#16191e",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 20, 24, 0.06), 0 1px 12px rgba(16, 20, 24, 0.06)",
        popover: "0 12px 40px rgba(16, 20, 24, 0.16)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
