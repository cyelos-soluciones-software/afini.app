import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  appleWebApp: {
    capable: true,
    title: "Eco · Cyelos",
    statusBarStyle: "default",
  },
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
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <IosInstallPrompt />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
