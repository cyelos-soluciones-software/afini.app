import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eco · Cyelos",
    short_name: "Eco",
    description: "Gestión de campañas y movilización digital",
    start_url: "/",
    display: "standalone",
    background_color: "#eef4f8",
    theme_color: "#007a9a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
