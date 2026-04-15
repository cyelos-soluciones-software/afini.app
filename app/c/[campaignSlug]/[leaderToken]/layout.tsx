/**
 * Layout del embudo ciudadano: variables CSS por campaña sin afectar el dashboard.
 * @module app/c/[campaignSlug]/[leaderToken]/layout
 */
import { prisma } from "@/lib/prisma";
import { funnelThemeToCssVars } from "@/lib/funnel-theme";

/**
 * Aplica variables CSS del tema de campaña solo al embudo público (`/c/...`).
 */
export default async function CitizenFunnelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ campaignSlug: string; leaderToken: string }>;
}) {
  const { campaignSlug } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { funnelTheme: true },
  });
  const themeStyle = funnelThemeToCssVars(campaign?.funnelTheme ?? null);

  return (
    <div
      className="min-h-dvh bg-[var(--background)] text-[var(--foreground)] antialiased"
      style={themeStyle}
    >
      {children}
    </div>
  );
}
