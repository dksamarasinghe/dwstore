import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
    },
    extend: {
      maxWidth: {
        "8xl": "1440px",
        "9xl": "1600px",
      },
      colors: {
        primary: {
          DEFAULT: "#1E64F0",
          hover: "#1751C7",
          light: "#EBF2FF",
          dark: "#1240A3",
        },
      },
      fontFamily: {
        sans: [
          "'Plus Jakarta Sans'",
          "'Inter'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
