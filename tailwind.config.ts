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
          lightOrange: "#FFF4EC",
          amber: "#F59E0B",
          dark: "#141518",
          darker: "#0D0E11",
          cardDark: "#1A1B20",
          gray: "#444444",
          light: "#F8F9FA",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-mitr)", "system-ui", "sans-serif"],
        mitr: ["var(--font-mitr)", "sans-serif"],
        display: ["var(--font-sans)", "var(--font-mitr)", "sans-serif"],
      },
      boxShadow: {
        "brand-sm": "0 2px 8px -1px rgba(255, 107, 0, 0.15)",
        "brand-md": "0 8px 24px -4px rgba(255, 107, 0, 0.22)",
        "brand-lg": "0 16px 36px -6px rgba(255, 107, 0, 0.28)",
        "card-hover": "0 14px 34px -4px rgba(0, 0, 0, 0.08)",
        "card-dark-hover": "0 14px 34px -4px rgba(0, 0, 0, 0.45)",
        "glow": "0 0 25px rgba(255, 107, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
