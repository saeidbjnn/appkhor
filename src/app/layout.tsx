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
  title: "اپ‌خور",
  description: "مرجع اپ‌ها و ابزارهای کاربردی",
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