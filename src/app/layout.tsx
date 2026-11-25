import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Clash Display — the reference's typeface, self-hosted from Fontshare.
const clash = localFont({
  variable: "--font-clash",
  display: "swap",
  src: [
    { path: "../fonts/ClashDisplay-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ClashDisplay-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "EXQUISITE CRAFT — Cases with character",
  description:
    "Custom phone cases for a life less ordinary. Explore expressive artwork, playful colour and designs made personal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${clash.variable} antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-cream"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
