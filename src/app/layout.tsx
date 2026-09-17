import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../lib/providers/provider";
import ThemeHydrator from "../components/shared/ThemeHydrator";
import { DEFAULT_APP_THEME, THEME_BOOTSTRAP_SCRIPT } from "../lib/theme";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://trackmarkets.vercel.app",
  ),
  title: {
    default: "Trackmarkets | Next-Gen Trading & Referral Platform",
    template: "%s | Trackmarkets",
  },
  description:
    "Advanced service provider and 10-level referral management system integrated with RoboForex. Track team volumes, lot distributions, automated commission tiers, and instant wallet payouts.",
  keywords: [
    "Trackmarkets",
    "RoboForex",
    "10-Level Referral",
    "Forex Trading",
    "Trading Commissions",
    "Multi-Tier Affiliate",
    "Broker Integration",
    "Fintech",
  ],
  authors: [{ name: "Trackmarkets" }],
  creator: "Trackmarkets",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Trackmarkets",
    title: "Trackmarkets | Next-Gen Trading & Referral Platform",
    description:
      "Advanced service provider and 10-level referral management system integrated with RoboForex. Track team volumes, lot distributions, automated commission tiers, and instant wallet payouts.",
    images: [
      {
        url: "/images/card-mesh.webp",
        width: 1200,
        height: 630,
        alt: "Trackmarkets — Next-Gen Trading & Referral Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trackmarkets | Next-Gen Trading & Referral Platform",
    description:
      "Advanced service provider and 10-level referral management system integrated with RoboForex. Track team volumes, lot distributions, automated commission tiers, and instant wallet payouts.",
    images: ["/images/card-mesh.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme={DEFAULT_APP_THEME} suppressHydrationWarning>
      <head>
        <script id="theme-bootstrap">{THEME_BOOTSTRAP_SCRIPT}</script>
      </head>
      <body
        className={`${inter.variable} font-inter antialiased flex bg-background`}
      >
        <ThemeHydrator />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
