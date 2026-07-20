import type { Metadata } from "next";
import "./globals.css";

// NOTE: this environment cannot reach fonts.googleapis.com to fetch
// next/font/google at build time. Font families are defined as system
// stacks in tailwind.config.ts instead. Once deployed somewhere with
// normal internet access, swap in next/font/google for Sora/Inter/JetBrains
// Mono to match the intended type pairing exactly.

export const metadata: Metadata = {
  title: "CHRIS TECH — WhatsApp Automation for Business",
  description:
    "Connect WhatsApp, automate customer conversations, and scale support with intelligent workflows built for growing businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
