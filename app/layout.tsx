import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DeckFlow — Boardroom-Ready Finance Slides",
  description:
    "Upload your spreadsheet. Choose your style. Download a polished presentation in seconds.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className={`${inter.className} min-h-full flex flex-col bg-[#0A0A0A] text-white`}>
        {children}
      </body>
    </html>
  );
}
