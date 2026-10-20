import type { Viewport } from "next";
import { Inter } from "next/font/google";
import { site } from "@/config/site";
import { themeColors } from "@/config/theme";
import { baseMetadata } from "@/lib/seo/metadata";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  // Optical sizing: large headings automatically use Inter's tighter display cut.
  axes: ["opsz"],
});

export const metadata = baseMetadata();

export const viewport: Viewport = {
  themeColor: themeColors.canvas,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Smooth scrolling is for in-page links only; route changes jump straight to the top.
    <html lang={site.language} className={inter.variable} data-scroll-behavior="smooth">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
