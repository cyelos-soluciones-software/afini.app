import React from "react";
import { Resend } from "resend";
import AffinityResultEmail, { type AffinityResultEmailProps } from "@/emails/AffinityResultEmail";

export type SendAffinityEmailData = {
  to: string;
  userName: string;
  affinityScore: number | null;
  sentiment: AffinityResultEmailProps["sentiment"];
  aiConclusion: string;
  campaign: Omit<AffinityResultEmailProps["campaign"], "colors"> & {
    funnelTheme: unknown;
  };
  campaignLinks: AffinityResultEmailProps["campaignLinks"];
};

function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("Falta RESEND_API_KEY en variables de entorno.");
  }
  return new Resend(key);
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function getThemeColors(funnelTheme: unknown): AffinityResultEmailProps["campaign"]["colors"] {
  const obj = (funnelTheme && typeof funnelTheme === "object" ? (funnelTheme as Record<string, unknown>) : {}) as Record<
    string,
    unknown
  >;

  const background = isHexColor(obj["--background"]) ? String(obj["--background"]) : "#0b0b0f";
  const foreground = isHexColor(obj["--foreground"]) ? String(obj["--foreground"]) : "#f3f4f6";
  const muted = isHexColor(obj["--muted"]) ? String(obj["--muted"]) : "#9ca3af";
  const border = isHexColor(obj["--border"]) ? String(obj["--border"]) : "#23232a";
  const surface = isHexColor(obj["--surface"]) ? String(obj["--surface"]) : "#111218";
  const primary = isHexColor(obj["--primary"]) ? String(obj["--primary"]) : "#ef4444";
  const primaryForeground = isHexColor(obj["--primary-foreground"])
    ? String(obj["--primary-foreground"])
    : "#0b0b0f";

  return { background, foreground, muted, border, surface, primary, primaryForeground };
}

function stripNewlinesForSubject(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Envía el correo de resultado de afinidad sin bloquear el request principal.
 * @remarks Debe ser llamado dentro de `waitUntil(...)` para ejecución asíncrona en Vercel.
 */
export async function sendAffinityEmail(data: SendAffinityEmailData) {
  const resend = getResendClient();
  const colors = getThemeColors(data.campaign.funnelTheme);

  const subject = stripNewlinesForSubject(`Tu resultado en ${data.campaign.name} — Afini`);

  return await resend.emails.send({
    from: 'Afini.app <no-reply@afini.app>',
    to: data.to,
    subject,
    // Evitamos TSX aquí para compatibilidad con Turbopack en archivos `.ts`.
    react: React.createElement(AffinityResultEmail, {
      userName: data.userName,
      affinityScore: data.affinityScore,
      sentiment: data.sentiment,
      aiConclusion: data.aiConclusion,
      campaign: {
        name: data.campaign.name,
        slogan: data.campaign.slogan ?? null,
        description: data.campaign.description ?? null,
        bannerUrl: data.campaign.bannerUrl ?? null,
        photoUrl: data.campaign.photoUrl ?? null,
        closingCtaText: data.campaign.closingCtaText ?? null,
        colors,
      },
      campaignLinks: data.campaignLinks,
    }),
  });
}

