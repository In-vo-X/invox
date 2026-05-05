import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { WalletProvider } from "@/components/providers/wallet-provider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlowPay",
  description: "On-chain invoice cashflow protocol on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--app-bg)] text-[var(--ink-900)]">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
