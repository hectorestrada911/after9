import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4F46E5",
          dark: "#3730A3",
          soft: "#EEF2FF",
        },
        accent: {
          mint: "#10B981",
          sky: "#0EA5E9",
        },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        glow: "0 12px 35px rgba(79, 70, 229, 0.25)",
      },
      borderRadius: {
        xl2: "1rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        fadeUp: "fadeUp 600ms ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
