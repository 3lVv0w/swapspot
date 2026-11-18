import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "../styles.css";

export const metadata: Metadata = {
  title: "SwapSpot — Voice Parking Assistant",
  description: "A voice-first parking finder demonstration.",
};

export const viewport: Viewport = {
  themeColor: "#07090D",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* App Router root layouts apply fonts across all routes. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
