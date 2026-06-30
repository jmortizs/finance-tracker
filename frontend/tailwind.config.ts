import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#000000",
        ink: "#FFFFFF",
        muted: "#888888",
        "muted-strong": "#A0A0A0",
        grid: "#1C1C1C",
        accent: "#C5FF00"
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "SF Mono",
          "Consolas",
          "Liberation Mono",
          "Menlo",
          "monospace"
        ]
      },
      boxShadow: {
        none: "none"
      }
    }
  },
  plugins: []
} satisfies Config;
