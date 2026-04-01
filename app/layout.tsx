import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Growth Check",
  description: "Growth tracking and health monitoring for children.",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Auth Guard is now handled in proxy.ts (middleware)
  // This allows RootLayout to be compatible with cacheComponents: true

  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${lexend.variable} antialiased font-sans`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
