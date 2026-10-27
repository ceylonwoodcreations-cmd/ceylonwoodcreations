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
        wood: {
          50: "#fdf8f6",
          100: "#f2e8e5",
          200: "#e5d1cb",
          300: "#d3b2a5",
          400: "#b88a74",
          500: "#8b5a2b",
          600: "#754b24",
          700: "#5c3a21",
          800: "#3e2723",
          900: "#271815",
          950: "#160c0a",
        },
      },
      fontFamily: {
        brand: ["var(--font-playfair)", "serif"],
        sinhala: ["var(--font-noto-sinhala)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
