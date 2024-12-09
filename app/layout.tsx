import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import DynamicProvider from "@/lib/providers/DynamicProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster"


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Chain of Throne",
  description: "Where Strategy Meets Blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <DynamicProvider>
          <Header />
          {children}
          <Footer />
          <Toaster />
        </DynamicProvider>
      </body>
    </html >
  );
}
