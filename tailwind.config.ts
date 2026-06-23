import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        field: "#16A34A",
        "field-dark": "#064E3B",
        trophy: "#FACC15",
        ink: "#111827"
      },
      boxShadow: {
        pitch: "0 24px 80px rgba(6, 78, 59, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
