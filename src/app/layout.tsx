import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Aura Wealth Terminal — Pakistan Prize Bond & Currency Assistant",
    template: "%s | Aura Wealth Terminal",
  },
  description:
    "Check prize bonds, track your portfolio, monitor currency rates, and get AI-powered financial assistance — all in one place. Pakistan's smartest prize bond & currency platform.",
  keywords: [
    "prize bond checker Pakistan",
    "prize bond result",
    "prize bond scanner",
    "currency exchange Pakistan",
    "USD to PKR",
    "currency converter",
    "AI financial assistant",
    "Pakistan prize bond portfolio",
    "prize bond check online",
  ],
  openGraph: {
    title: "Aura Wealth Terminal — Your Smart Prize Bond & Currency Assistant",
    description:
      "Check prize bonds, track portfolios, monitor currency rates with AI-powered insights for Pakistan.",
    type: "website",
    locale: "en_PK",
    siteName: "Aura Wealth Terminal",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import { AppProvider } from "@/context/AppContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-[#060714] text-slate-100 antialiased`}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
