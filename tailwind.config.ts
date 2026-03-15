import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        foreground: "var(--foreground)",
        "foreground-secondary": "var(--foreground-secondary)",
        border: "var(--border)",
        // Area colors
        area: {
          seated: "#3D4FE0",
          restauracje: "#C4472A",
          pp: "#5C7A3E",
          zdrowie: "#2E7D52",
          relacje: "#B8956A",
          finanse: "#C49A1A",
          marka: "#404040",
        },
        // Semantic
        accent: "#3D4FE0",
        success: "#2E7D52",
        warning: "#C49A1A",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      maxWidth: {
        content: "680px",
      },
      borderRadius: {
        card: "8px",
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
      },
    },
  },
  plugins: [],
};
export default config;
