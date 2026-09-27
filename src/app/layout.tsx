import type { Metadata } from "next";
import Script from "next/script";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import { DirectionProvider } from "@/components/ui/direction";
import { AppThemeProvider } from "@/components/app-theme-provider";

import "./globals.css";

const samim = localFont({
  src: [
    {
      path: "./fonts/Samim.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Samim-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Samim-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-samim",
  display: "swap",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://appkhor.ir"),
  title: {
    default:
      "\u0627\u067e\u200c\u062e\u0648\u0631 | \u0627\u067e\u200c\u0647\u0627 \u0648 \u0627\u0628\u0632\u0627\u0631\u0647\u0627\u06cc \u06a9\u0627\u0631\u0628\u0631\u062f\u06cc",
    template:
      "%s | \u0627\u067e\u200c\u062e\u0648\u0631",
  },
  description:
    "\u06a9\u0634\u0641 \u0627\u067e\u200c\u0647\u0627 \u0648 \u0627\u0628\u0632\u0627\u0631\u0647\u0627\u06cc \u06a9\u0627\u0631\u0628\u0631\u062f\u06cc \u0628\u0627 \u0645\u0639\u0631\u0641\u06cc \u0641\u0627\u0631\u0633\u06cc \u0648 \u0644\u06cc\u0646\u06a9 \u0645\u0633\u062a\u0642\u06cc\u0645 \u0628\u0647 \u0645\u0646\u0627\u0628\u0639 \u0631\u0633\u0645\u06cc.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "/",
    siteName:
      "\u0627\u067e\u200c\u062e\u0648\u0631",
    title:
      "\u0627\u067e\u200c\u062e\u0648\u0631 | \u0627\u067e\u200c\u0647\u0627 \u0648 \u0627\u0628\u0632\u0627\u0631\u0647\u0627\u06cc \u06a9\u0627\u0631\u0628\u0631\u062f\u06cc",
    description:
      "\u06a9\u0634\u0641 \u0627\u067e\u200c\u0647\u0627 \u0648 \u0627\u0628\u0632\u0627\u0631\u0647\u0627\u06cc \u06a9\u0627\u0631\u0628\u0631\u062f\u06cc \u0628\u0627 \u0645\u0639\u0631\u0641\u06cc \u0641\u0627\u0631\u0633\u06cc.",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "\u0627\u067e\u200c\u062e\u0648\u0631",
    description:
      "\u0645\u0631\u062c\u0639 \u0641\u0627\u0631\u0633\u06cc \u06a9\u0634\u0641 \u0627\u067e\u200c\u0647\u0627 \u0648 \u0627\u0628\u0632\u0627\u0631\u0647\u0627\u06cc \u06a9\u0627\u0631\u0628\u0631\u062f\u06cc.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
    >
      <body
        className={`${samim.className} ${samim.variable} ${fontMono.variable} antialiased`}
      >
        <AppThemeProvider>
          <DirectionProvider direction="rtl">
            {children}
          </DirectionProvider>
        </AppThemeProvider>

        <Script
          id="appkhor-theme-init"
          strategy="beforeInteractive"
        >
          {`
            (function () {
              try {
                var savedTheme = localStorage.getItem("appkhor-theme");

                var theme =
                  savedTheme === "dark" || savedTheme === "light"
                    ? savedTheme
                    : window.matchMedia("(prefers-color-scheme: dark)").matches
                      ? "dark"
                      : "light";

                document.documentElement.dataset.theme = theme;
                document.documentElement.style.colorScheme = theme;
              } catch (error) {
                document.documentElement.dataset.theme = "light";
                document.documentElement.style.colorScheme = "light";
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}