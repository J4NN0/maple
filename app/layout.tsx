import type { Metadata } from "next";
import { Dancing_Script, Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const title = "Maple & Chill";
const description =
  "Meet Maple the toy poodle — play games, chase treats, and follow her adventures!";

export const metadata: Metadata = {
  metadataBase: new URL("https://mapleandchill.vercel.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/",
    siteName: title,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Maple the toy poodle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dancingScript.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
