import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Pinyon_Script } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
});

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

export const metadata: Metadata = {
  title: "Convite",
  description: "Convite digital",
};

export const viewport: Viewport = {
  themeColor: "#18211c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${cormorant.variable} ${pinyon.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
