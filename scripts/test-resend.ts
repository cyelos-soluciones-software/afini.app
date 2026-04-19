/**
 * Script local para probar Resend + React Email sin pasar por el funnel.
 *
 * Uso:
 *   TEST_EMAIL_TO="tu@correo.com" npm run email:test
 */
import "dotenv/config";
import { sendAffinityEmail } from "@/lib/email-service";

async function main() {
  const to = process.env.TEST_EMAIL_TO?.trim();
  if (!to) throw new Error("Falta TEST_EMAIL_TO (correo destino) en variables de entorno.");

  const userName = process.env.TEST_EMAIL_NAME?.trim() || "Ciudadano/a";

  const result = await sendAffinityEmail({
    to,
    userName,
    affinityScore: 0.74,
    sentiment: "positive",
    aiConclusion:
      "Gracias por participar. Esta es una prueba de envío con Resend.\n\nSi ves este correo, el pipeline de email está funcionando.",
    campaign: {
      name: "Campaña de prueba",
      slogan: "Un futuro mejor",
      description: "Correo de prueba para validar el envío asíncrono del funnel.",
      bannerUrl: null,
      photoUrl: null,
      closingCtaText:
        "Este es un ejemplo del mensaje final del funnel.\n\nPuedes incluir enlaces como https://afini.app y otros detalles.",
      funnelTheme: {
        "--background": "#0b0b0f",
        "--foreground": "#f3f4f6",
        "--muted": "#9ca3af",
        "--border": "#23232a",
        "--surface": "#111218",
        "--primary": "#ef4444",
        "--primary-foreground": "#0b0b0f",
      },
    },
    campaignLinks: {
      vakiUrl: "https://vaki.co/",
    },
  });

  // eslint-disable-next-line no-console
  console.log("Resend response:", result);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

