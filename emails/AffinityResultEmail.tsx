import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

export type AffinityResultEmailProps = {
  userName: string;
  affinityScore: number | null;
  sentiment: "positive" | "neutral" | "negative" | string | null;
  aiConclusion: string;
  campaign: {
    name: string;
    slogan: string | null;
    description: string | null;
    bannerUrl: string | null;
    photoUrl: string | null;
    closingCtaText: string | null;
    colors: {
      background: string;
      foreground: string;
      surface: string;
      muted: string;
      border: string;
      primary: string;
      primaryForeground: string;
    };
  };
  campaignLinks: {
    vakiUrl?: string | null;
  };
};

function formatAffinity(score: number | null): string {
  if (score === null || Number.isNaN(score)) return "—";
  const pct = Math.round(Math.max(0, Math.min(1, score)) * 100);
  return `${pct}%`;
}

function formatSentiment(sentiment: AffinityResultEmailProps["sentiment"]): string {
  switch (sentiment) {
    case "positive":
      return "Positivo";
    case "neutral":
      return "Neutral";
    case "negative":
      return "Negativo";
    default:
      return "—";
  }
}

export function AffinityResultEmail({
  userName,
  affinityScore,
  sentiment,
  aiConclusion,
  campaign,
  campaignLinks,
}: AffinityResultEmailProps) {
  const preview = `${campaign.name}: tu resultado de afinidad`;
  const colors = campaign.colors;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body
          className="m-0 p-0"
          style={{
            backgroundColor: colors.background,
            color: colors.foreground,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
          }}
        >
          <Container className="mx-auto my-0 px-4 py-6" style={{ maxWidth: 560 }}>
            <Section
              className="overflow-hidden rounded-2xl"
              style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
            >
              {campaign.bannerUrl ? (
                <Img
                  src={campaign.bannerUrl}
                  alt={`Banner de ${campaign.name}`}
                  width="560"
                  height="210"
                  className="block w-full"
                  style={{ objectFit: "cover" }}
                />
              ) : null}

              <Section className="px-6 py-6">
                <Section className="flex items-start" style={{ gap: 12 }}>
                  {campaign.photoUrl ? (
                    <Img
                      src={campaign.photoUrl}
                      alt={`Foto de ${campaign.name}`}
                      width="56"
                      height="56"
                      className="rounded-full"
                      style={{ border: `1px solid ${colors.border}`, objectFit: "cover" }}
                    />
                  ) : null}
                  <Section className="min-w-0">
                    <Heading className="m-0 text-[20px] font-semibold leading-tight">
                      {campaign.name}
                    </Heading>
                    {campaign.slogan ? (
                      <Text className="m-0 mt-1 text-[14px]" style={{ color: colors.muted }}>
                        {campaign.slogan}
                      </Text>
                    ) : null}
                    {campaign.description ? (
                      <Text className="m-0 mt-2 text-[13px] leading-relaxed" style={{ color: colors.muted }}>
                        {campaign.description}
                      </Text>
                    ) : null}
                  </Section>
                </Section>

                <Hr className="my-5" style={{ borderColor: colors.border }} />

                <Heading className="m-0 text-[18px] font-semibold">Tu resultado</Heading>
                <Text className="m-0 mt-2 text-[14px]" style={{ color: colors.muted }}>
                  Hola {userName.trim().split(/\s+/)[0] || userName}, gracias por participar.
                </Text>

                <Section className="mt-4 rounded-xl px-4 py-3" style={{ border: `1px solid ${colors.border}` }}>
                  <Text className="m-0 text-[13px]" style={{ color: colors.muted }}>
                    Afinidad
                  </Text>
                  <Text className="m-0 text-[22px] font-semibold">{formatAffinity(affinityScore)}</Text>
                  <Text className="m-0 mt-2 text-[13px]" style={{ color: colors.muted }}>
                    Sentimiento: <span style={{ color: colors.foreground }}>{formatSentiment(sentiment)}</span>
                  </Text>
                </Section>

                <Section className="mt-4">
                  <Text className="m-0 text-[13px]" style={{ color: colors.muted }}>
                    Conclusión
                  </Text>
                  <Text className="m-0 mt-2 whitespace-pre-wrap text-[14px] leading-relaxed">
                    {aiConclusion}
                  </Text>
                </Section>

                {campaign.closingCtaText?.trim() ? (
                  <>
                    <Hr className="my-5" style={{ borderColor: colors.border }} />
                    <Heading className="m-0 text-[16px] font-semibold">Mensaje final</Heading>
                    <Text className="m-0 mt-2 text-[13px]" style={{ color: colors.muted }}>
                      Información adicional compartida por la campaña.
                    </Text>

                    <Text className="m-0 mt-3 whitespace-pre-wrap text-[14px] leading-relaxed">
                      {campaign.closingCtaText.trim()}
                    </Text>
                    {campaignLinks.vakiUrl ? (
                      <Section className="mt-4">
                        <Button
                          href={campaignLinks.vakiUrl}
                          className="inline-block rounded-xl px-4 py-3 text-[14px] font-semibold"
                          style={{
                            backgroundColor: colors.primary,
                            color: colors.primaryForeground,
                            textDecoration: "none",
                          }}
                        >
                          Apoyar en Vaki
                        </Button>
                      </Section>
                    ) : null}
                  </>
                ) : null}

                <Hr className="my-5" style={{ borderColor: colors.border }} />
                <Text className="m-0 text-[11px]" style={{ color: colors.muted }}>
                  Este correo fue enviado por Afini como parte del resultado del funnel ciudadano.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default AffinityResultEmail;

