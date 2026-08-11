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
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Layered, low-contrast shadows read as expensive; harsh single drops read cheap.
        card: "0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.05)",
        "card-hover":
          "0 12px 32px -8px rgb(16 24 40 / 0.13), 0 4px 12px -4px rgb(16 24 40 / 0.08)",
        soft: "0 10px 34px -10px rgb(16 24 40 / 0.14)",
        elevated:
          "0 28px 64px -20px rgb(16 24 40 / 0.32), 0 10px 26px -14px rgb(16 24 40 / 0.18)",
        glow: "0 10px 30px -8px rgb(13 148 136 / 0.42)",
        "inner-top": "inset 0 1px 0 0 rgb(255 255 255 / 0.6)",
        ring: "inset 0 0 0 1px rgb(15 23 42 / 0.06)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0f766e 0%, #0d9488 42%, #10b981 100%)",
        "brand-radial":
          "radial-gradient(60% 60% at 50% 0%, rgba(13,148,136,0.10) 0%, transparent 70%)",
        "hero-mesh":
          "radial-gradient(38rem 26rem at 12% 0%, rgba(45,212,191,0.16), transparent 60%), radial-gradient(34rem 24rem at 100% 20%, rgba(16,185,129,0.14), transparent 58%), linear-gradient(135deg, #0b3f3a 0%, #0f766e 55%, #059669 100%)",
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
