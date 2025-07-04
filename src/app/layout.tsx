import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gelato Smart Wallet - Interactive Demo",
  description:
    "Explore Gelato's Smart Wallet SDK with interactive examples. Learn how to implement different payment methods, account types, and utility functions.",
  keywords: [
    "Gelato",
    "Smart Wallet",
    "Web3",
    "Blockchain",
    "SDK",
    "Interactive Demo",
  ],
  authors: [{ name: "Gelato Network" }],
  openGraph: {
    title: "Gelato Smart Wallet - Interactive Demo",
    description: "Explore Gelato's Smart Wallet SDK with interactive examples",
    type: "website",
    url: "https://gelato.network",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
