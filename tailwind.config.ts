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
          orange: "#FF6B00",
          darkOrange: "#E8501E",
          dark: "#222222",
          gray: "#444444",
          light: "#F8F9FA",
        },
      },
      fontFamily: {
        sans: ["var(--font-mitr)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
