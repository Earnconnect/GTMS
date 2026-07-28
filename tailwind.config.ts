import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcd9ff",
          300: "#8ec1ff",
          400: "#599dff",
          500: "#3479fb",
          600: "#1f5af0",
          700: "#1846dc",
          800: "#1a3bb2",
          900: "#1b378c",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
