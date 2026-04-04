import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Afini",
    short_name: "Afini",
    description:
      "Redes de afinidad: funnel con IA, paneles para súper admin, administrador de campaña y líder. Instálala como app en tu móvil.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#fafafa",
    theme_color: "#d12f2f",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/logos/LogoCodeImagen.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logos/LogoCodeImagen.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
