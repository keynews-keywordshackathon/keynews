import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter_Tight, Playfair_Display, STIX_Two_Text, Jacquard_24 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const stix = STIX_Two_Text({
  variable: "--font-stix",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const jacquard = Jacquard_24({
  variable: "--font-jacquard",
  subsets: ["latin"],
  weight: "400",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Keynews Daily",
  description: "Your personalized AI newspaper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${stix.variable} ${jacquard.variable} ${interTight.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
