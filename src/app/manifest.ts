import type { MetadataRoute } from "next";

/**
 * Salvo na tela de início do celular, o convite abre em tela cheia — sem
 * barra de endereço nem barra de navegação do Safari.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Convite",
    short_name: "Convite",
    description: "Convite digital",
    // Sem start_url: quem salva abre de volta no próprio convite, não na home.
    display: "standalone",
    orientation: "portrait",
    background_color: "#18211c",
    theme_color: "#18211c",
    icons: [
      { src: "/icone.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
