import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GTMS — Workforce & Payroll Platform",
  description:
    "GTMS unifies recruiting, onboarding, training, and payroll — hire, onboard, and pay your team in one elegant workspace.",
  icons: { icon: "/gtms-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
