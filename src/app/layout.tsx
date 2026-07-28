import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTMS — Micro-Task Marketplace",
  description:
    "A legitimate micro-task marketplace: get real work done, pay workers fairly per approved deliverable.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
