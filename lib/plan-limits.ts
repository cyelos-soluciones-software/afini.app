/**
 * Límites PLG / freemium por campaña (líderes y ciudadanos).
 * El administrador puede tener muchas campañas; la negociación Premium es por campaña.
 * @packageDocumentation
 */
import { prisma } from "@/lib/prisma";

/** Cupo de líderes digitales en plan gratuito (por campaña), salvo Premium en esa campaña. */
export const FREE_TIER_MAX_LEADERS_PER_CAMPAIGN = 1;

/** Valor por defecto del cupo de ciudadanos (freemium) si no se indica otro. */
export const FREE_TIER_MAX_VOTERS_PER_CAMPAIGN = 25;
/** @deprecated Usar `voterWarningThreshold(cap)` con el cupo real de la campaña. */
export const FREE_TIER_VOTER_WARN_THRESHOLD = 20;

/**
 * A partir de qué número de ciudadanos mostrar aviso “casi lleno” (~80 % del cupo).
 */
export function voterWarningThreshold(maxVotersCap: number): number {
  if (maxVotersCap <= 1) return 1;
  return Math.max(1, Math.floor(maxVotersCap * 0.8));
}

/**
 * Campañas distintas donde el usuario es creador o está en `CampaignAdmin`.
 */
export async function countDistinctCampaignsAsAdmin(userId: string): Promise<number> {
  const [adminLinks, created] = await Promise.all([
    prisma.campaignAdmin.findMany({
      where: { userId },
      select: { campaignId: true },
    }),
    prisma.campaign.findMany({
      where: { creatorId: userId },
      select: { id: true },
    }),
  ]);
  return new Set([...adminLinks.map((a) => a.campaignId), ...created.map((c) => c.id)]).size;
}

/**
 * IDs de campaña donde el usuario es creador o está en `CampaignAdmin` (misma lógica que el conteo distinto).
 */
export async function getAccessibleCampaignIdsForCampaignAdmin(userId: string): Promise<string[]> {
  const [adminLinks, created] = await Promise.all([
    prisma.campaignAdmin.findMany({
      where: { userId },
      select: { campaignId: true },
    }),
    prisma.campaign.findMany({
      where: { creatorId: userId },
      select: { id: true },
    }),
  ]);
  return [...new Set([...adminLinks.map((a) => a.campaignId), ...created.map((c) => c.id)])];
}

/**
 * Si algún administrador vinculado a la campaña (o el creador) tiene plan PREMIUM en esa relación,
 * la campaña se considera con presupuesto Premium (ciudadanos y, en app, cupo ampliado de líderes).
 */
export async function campaignHasPremiumVoterBudget(campaignId: string): Promise<boolean> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      creator: { select: { billingPlan: true } },
      admins: { select: { user: { select: { billingPlan: true } } } },
    },
  });
  if (!campaign) return false;
  if (campaign.creator?.billingPlan === "PREMIUM") return true;
  return campaign.admins.some((a) => a.user.billingPlan === "PREMIUM");
}
