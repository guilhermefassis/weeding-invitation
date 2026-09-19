import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-sans-ui",
});

export const metadata: Metadata = {
  title: "Convite",
  description: "Convite digital",
};

export const viewport: Viewport = {
  themeColor: "#2a2420",
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
        className={`${cormorant.variable} ${greatVibes.variable} ${jost.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
