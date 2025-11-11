import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import FrameWalletProvider from "@/lib/providers/FarcasterWalletProvider";
import DynamicProvider from "@/lib/providers/DynamicProvider";
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

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
//       >
//         <FrameWalletProvider>
//           <FrameProvider>
//             {children}
//             <Toaster />
//           </FrameProvider>
//         </FrameWalletProvider>
//       </body>
//     </html>
//   );
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <DynamicProvider>
          {children}
          <Toaster />
        </DynamicProvider>
      </body>
    </html>
  );
}