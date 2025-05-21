import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import DynamicProvider from "@/lib/providers/FarcasterWalletProvider";
import { Header, Footer } from "@/components/layout";
import { Toaster } from "@/components/ui/toaster"
import { FrameProvider } from "@/lib/providers/FarcasterProvider";


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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <DynamicProvider>
          <FrameProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
          </FrameProvider>
        </DynamicProvider>
      </body>
    </html>
  );
}
