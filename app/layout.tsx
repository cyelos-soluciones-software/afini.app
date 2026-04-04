import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono, Outfit } from "next/font/google";
import { AppFooter } from "@/app/components/app-footer";
import { IosInstallPrompt } from "@/app/components/ios-install-prompt";
import { ServiceWorkerRegister } from "@/app/components/service-worker-register";
import { Providers } from "@/app/providers";
import "./globals.css";

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
  title: "Afini",
  description:
    "Plataforma para crear y evaluar redes de afinidad: funnel con IA, paneles por rol y PWA en móvil.",
  applicationName: "Afini",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logos/Logo-Cyelos.png", type: "image/png" }],
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
