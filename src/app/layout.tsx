import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

// Body / UI type — highly legible, neutral, excellent at small sizes.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Display type — headings, KPI figures, the wordmark. A confident, modern
// grotesque that gives the product an official, high-end fintech register.
const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GTMS — Workforce & Payroll Platform",
    template: "%s · GTMS",
  },
  description:
    "GTMS unifies recruiting, onboarding, training, and payroll — hire, onboard, and pay your team in one secure, enterprise-grade workspace.",
  applicationName: "GTMS",
  icons: { icon: "/gtms-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
