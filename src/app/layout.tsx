import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VerifyLink — Instant Zero-Trust Scam & Link Inspector",
  description: "Securely inspect suspicious URLs with isolated Solari microVMs and AI.",
  icons: {
    icon: [
      { url: "/verifylink-logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/verifylink-logo.png",
    apple: "/verifylink-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#060709] text-zinc-100">
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
