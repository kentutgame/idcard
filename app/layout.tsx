import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WatermarkFooter } from "@/components/WatermarkFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ID Card Panitia 17-an - IPPCW REBORN",
  description: "Generator ID Card Panitia HUT RI IPPCW REBORN Cimanggu Wates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#160000] text-neutral-100 selection:bg-yellow-400 selection:text-red-900">
        <div className="flex-1 flex flex-col">{children}</div>
        <WatermarkFooter />
      </body>
    </html>
  );
}

