import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FBF8F1",
        cream: "#FDFCF7",
        mint: "#BFE3D0",
        mintdeep: "#4F9D82",
        sky: "#CBE4F5",
        skydeep: "#4A90B8",
        ink: "#33484A",
        sand: "#EDE7D6"
      },
      fontFamily: {
        display: ["\"Do Hyeon\"", "sans-serif"],
        body: ["\"Gowun Dodum\"", "sans-serif"]
      },
      boxShadow: {
        candy: "0 16px 40px rgba(79, 157, 130, 0.16)"
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
