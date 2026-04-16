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
          DEFAULT: "#F97316",
          dark: "#EA580C",
          soft: "#FFF7ED",
        },
        accent: {
          mint: "#84CC16",
          sky: "#F43F5E",
        },
      },
      boxShadow: {
        soft: "0 14px 45px rgba(2, 10, 26, 0.35)",
        glow: "0 16px 42px rgba(249, 115, 22, 0.35)",
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
