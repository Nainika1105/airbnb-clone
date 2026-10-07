import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: "#FF385C",
        "brand-dark": "#E31C5F",
        "gray-border": "#DDDDDD",
        "gray-text": "#717171",
        "gray-dark": "#222222",
      },
      boxShadow: {
        card: "0 6px 16px rgba(0,0,0,0.12)",
        pill: "0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
      },
      fontFamily: {
        sans: [
          "Circular",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
