import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppFooter } from "@/app/components/app-footer";
import { IosInstallPrompt } from "@/app/components/ios-install-prompt";
import { ServiceWorkerRegister } from "@/app/components/service-worker-register";
import { Providers } from "@/app/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eco · Cyelos",
  description: "Gestión de campañas y movilización digital",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logos/Logo-Cyelos.png", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Eco · Cyelos",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

/** Barra de estado / tema PWA alineado con la marca Cyelos. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#007a9a" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1520" },
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
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
