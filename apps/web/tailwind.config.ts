import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        paper: "#FFFFFF",
        ink: {
          DEFAULT: "#0C1420",
          soft: "#576072",
          faint: "#8A93A3",
        },
        line: "#E3E6EA",
        surface: {
          DEFAULT: "#F6F7F9",
          raised: "#FBFBFC",
        },
        signal: {
          DEFAULT: "#0E8F6F",
          deep: "#063D30",
          soft: "#E4F5EF",
        },
        amber: {
          DEFAULT: "#F2994A",
          soft: "#FDEEE0",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(12,20,32,0.04), 0 8px 24px -12px rgba(12,20,32,0.10)",
        pop: "0 12px 40px -16px rgba(6,61,48,0.35)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "tick-in": {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite linear",
        "tick-in": "tick-in 0.3s ease-out",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
