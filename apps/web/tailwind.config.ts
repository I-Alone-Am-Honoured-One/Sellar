import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: "#6c5ce7", dark: "#4b3ecf" } }
    }
  },
  plugins: []
} satisfies Config;
