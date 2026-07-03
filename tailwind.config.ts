import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        mint: "#A8E6CF",
        peach: "#FFD3B6",
        cream: "#FFF7E8",
        sky: "#CDE9FF",
        berry: "#FF8DA1"
      },
      fontFamily: {
        display: ["\"Do Hyeon\"", "sans-serif"],
        body: ["\"Gowun Dodum\"", "sans-serif"]
      },
      boxShadow: {
        candy: "0 16px 40px rgba(255, 141, 161, 0.25)"
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        }
      },
      animation: {
        floaty: "floaty 3s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
