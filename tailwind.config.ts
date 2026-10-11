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
        ink: "#172126",
        cloud: "#f4f7f5",
        mint: "#d8f3e6",
        sage: "#6da98d",
        coral: "#ed8268",
        sun: "#f5c96a",
      },
      boxShadow: {
        soft: "0 18px 55px rgba(23, 33, 38, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
