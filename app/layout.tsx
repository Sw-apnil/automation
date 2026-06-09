import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const viewport: Viewport = {
  themeColor: "#0B0F14"
};

export const metadata: Metadata = {
  title: {
    default: "Football Intelligence Platform",
    template: "%s — Football Intelligence"
  },
  description: "AI-powered football content automation platform. Collect intelligence, generate posts, publish to social media at scale.",
  keywords: ["football", "social media", "automation", "content", "AI"]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-sans">
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
