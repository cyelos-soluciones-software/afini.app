import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eco · Cyelos",
    short_name: "Eco",
    description: "Gestión de campañas y movilización digital",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0891b2",
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
