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
  // Salvo na tela de início, o convite abre sem as barras do navegador.
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Convite" },
  icons: { icon: "/icone.svg", apple: "/icone-180.png" },
  // O Next emite o nome novo da meta; o Safari de iOS mais antigo só entende
  // este aqui, e os dois juntos não conflitam.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#18211c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // Ocupa a tela até as bordas; sem isso o iPhone não informa as áreas do
  // entalhe e do indicador de home, e o CSS não tem como desviar delas.
  viewportFit: "cover",
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
