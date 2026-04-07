import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono, Outfit } from "next/font/google";
import { AppFooter } from "@/app/components/app-footer";
import { IosInstallPrompt } from "@/app/components/ios-install-prompt";
import { ServiceWorkerRegister } from "@/app/components/service-worker-register";
import { Providers } from "@/app/providers";
import "./globals.css";

const siteUrl =
  (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.startsWith("http")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://afini.app") as string;

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Afini — Inteligencia accionable con privacidad garantizada",
    template: "%s — Afini",
  },
  description:
    "Afini es un motor de afinidad con IA: convierte redes sociales en un embudo, mide sentimiento y moviliza sin exponer datos. Producto de Cyelos Soluciones de Software (Colombia).",
  applicationName: "Afini",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Afini",
    "inteligencia accionable",
    "sentimiento IA",
    "funnel",
    "mapa de calor",
    "campañas",
    "movilización",
    "Colombia",
    "Cyelos",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Afini",
    title: "Afini — Inteligencia accionable con privacidad garantizada",
    description:
      "Motor de afinidad con IA para medir sentimiento, activar interesados y entender el territorio con mapas de calor. Producto de Cyelos Soluciones de Software (Colombia).",
    images: [
      {
        url: "/logos/LogoCodeImagen.png",
        width: 512,
        height: 512,
        alt: "Afini (Cyelos)",
      },
    ],
    locale: "es_CO",
  },
  twitter: {
    card: "summary",
    title: "Afini — Inteligencia accionable con privacidad garantizada",
    description:
      "Motor de afinidad con IA para medir sentimiento y movilizar sin exponer datos. Producto de Cyelos (Colombia).",
    images: ["/logos/LogoCodeImagen.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [{ url: "/logos/LogoCodeImagen.png", type: "image/png" }],
    apple: [{ url: "/logos/LogoCodeImagen.png", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Afini",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

/** Barra de estado / PWA (marca Afini · afini.app). */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d12f2f" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${outfit.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-[100dvh] flex-col">
        <Providers>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          <AppFooter />
          <IosInstallPrompt />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
