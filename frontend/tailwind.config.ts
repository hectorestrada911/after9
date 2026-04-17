import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-display)", "Inter", "Helvetica", "Arial", "sans-serif"],
        display: ["var(--font-display)", "Inter", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        ink: "#000000",
        paper: "#ffffff",
        offwhite: "#f9f9f9",
        muted: "#71717a",
        line: "#e5e5e5",
        brand: {
          DEFAULT: "#000000",
          dark: "#1a1a1a",
          accent: "#f2ef1d",
          green: "#4BFA94",
          blue: "#0000FE",
        },
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.03em",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        createPop: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 500ms ease-out",
        createPop: "createPop 0.45s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
