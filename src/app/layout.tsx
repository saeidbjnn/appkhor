import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

import { DirectionProvider } from "@/components/ui/direction";

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
  variable: "--font-sans",
  display: "swap",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "اپ‌خور",
  description: "مرجع اپ‌ها و ابزارهای کاربردی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${samim.className} ${samim.variable} ${fontMono.variable} antialiased`}
      >
        <DirectionProvider direction="rtl">
          {children}
        </DirectionProvider>
      </body>
    </html>
  );
}