import type { Metadata } from "next";
import localFont from "next/font/local";
import { Rubik, Montserrat } from "next/font/google";
import { GeistSans } from "geist/font/sans";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});
import "./globals.css";
import Providers from "../lib/providers/provider";

const clashDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/ClashDisplay/ClashDisplay-Extralight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/ClashDisplay/ClashDisplay-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/ClashDisplay/ClashDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ClashDisplay/ClashDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/ClashDisplay/ClashDisplay-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/ClashDisplay/ClashDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-clash-display",
  display: "swap",
});

const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi/Satoshi-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi/Satoshi-LightItalic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/Satoshi/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi/Satoshi-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Satoshi/Satoshi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi/Satoshi-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/Satoshi/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi/Satoshi-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/Satoshi/Satoshi-Black.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi/Satoshi-BlackItalic.woff2",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const roobert = localFont({
  src: [
    {
      path: "../../public/fonts/RoobertSemiMono/RoobertSemiMonoTRIAL-Light-BF67243fd53fc7c.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/RoobertSemiMono/RoobertSemiMonoTRIAL-LightItalic-BF67243fd53a243.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/RoobertSemiMono/RoobertSemiMonoTRIAL-Regular-BF67243fd53ad6a.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/RoobertSemiMono/RoobertSemiMonoTRIAL-RegularItalic-BF67243fd53afce.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/RoobertSemiMono/RoobertSemiMonoTRIAL-Medium-BF67243fd524e58.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/RoobertSemiMono/RoobertSemiMonoTRIAL-MediumItalic-BF67243fd527dda.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/RoobertSemiMono/RoobertSemiMonoTRIAL-SemiBold-BF67243fd539b9e.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/RoobertSemiMono/RoobertSemiMonoTRIAL-SemiBoldItalic-BF67243fd53e269.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/RoobertSemiMono/RoobertSemiMonoTRIAL-Bold-BF67243fd539cff.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/RoobertSemiMono/RoobertSemiMonoTRIAL-BoldItalic-BF67243fd53f821.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/RoobertSemiMono/RoobertSemiMonoTRIAL-Heavy-BF67243fd53d89c.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/RoobertSemiMono/RoobertSemiMonoTRIAL-HeavyItalic-BF67243fd540151.otf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-roobert",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://crackmarkets.com",
  ),
  title: {
    default: "Crack Markets — Next-Gen Trading & 10-Level Referral Platform",
    template: "%s | Crack Markets",
  },
  description:
    "Advanced service provider and 10-level referral management system integrated with RoboForex. Track team volumes, lot distributions, automated commission tiers, and instant wallet payouts.",
  keywords: [
    "Crack Markets",
    "RoboForex",
    "10-Level Referral",
    "Forex Trading",
    "Trading Commissions",
    "Multi-Tier Affiliate",
    "Broker Integration",
    "Fintech",
  ],
  authors: [{ name: "Crack Markets" }],
  creator: "Crack Markets",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Crack Markets",
    title: "Crack Markets — Next-Gen Trading & 10-Level Referral Platform",
    description:
      "Advanced service provider and 10-level referral management system integrated with RoboForex. Track team volumes, lot distributions, automated commission tiers, and instant wallet payouts.",
    images: [
      {
        url: "/images/card-mesh.webp",
        width: 1200,
        height: 630,
        alt: "Crack Markets — Next-Gen Trading & Referral Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crack Markets — Next-Gen Trading & 10-Level Referral Platform",
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
    <html lang="en" data-theme="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          const appState = localStorage.getItem("crackmarkets-app-state");
          console.log(appState)
          const theme = JSON.parse(appState).state.theme;
          if (theme) {
            document.documentElement.setAttribute("data-theme", theme);
          }
        `,
          }}
        />
      </head>

      <body
        className={`${clashDisplay.variable} ${satoshi.variable} ${roobert.variable} ${rubik.variable} ${montserrat.variable} ${GeistSans.variable} antialiased flex bg-background`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
