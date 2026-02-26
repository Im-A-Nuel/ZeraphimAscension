import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        default: "#0a0a0a",
        main: "#111111",
        elevated: "#1a1a1a",
        line: "#2a2a2a",
        text: "#f5f5f5",
        mute: "#9a9a9a",
      },
    },
  },
  plugins: [],
};

export default config;
