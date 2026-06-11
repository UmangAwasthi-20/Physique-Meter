import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        physique: {
          blue: "#1184ff",
          black: "#070707",
          panel: "#101114"
        }
      }
    }
  },
  plugins: []
};

export default config;
