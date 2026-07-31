import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Brand = teal/emerald (fintech/payroll). Remapping `brand` re-themes
        // every existing `brand-*` utility across the app in one place.
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        // Secondary accent for gradients / highlights.
        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.06)",
        "card-hover":
          "0 10px 30px -6px rgb(16 24 40 / 0.12), 0 4px 10px -4px rgb(16 24 40 / 0.08)",
        soft: "0 8px 30px -8px rgb(16 24 40 / 0.12)",
        elevated:
          "0 24px 60px -18px rgb(16 24 40 / 0.28), 0 8px 24px -12px rgb(16 24 40 / 0.16)",
        glow: "0 8px 30px -6px rgb(13 148 136 / 0.45)",
        "inner-top": "inset 0 1px 0 0 rgb(255 255 255 / 0.6)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0d9488 0%, #10b981 100%)",
        "brand-radial":
          "radial-gradient(60% 60% at 50% 0%, rgba(13,148,136,0.10) 0%, transparent 70%)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
