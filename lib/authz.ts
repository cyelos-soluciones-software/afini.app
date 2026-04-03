import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Comprueba si el usuario puede leer/escribir datos de una campaña (multi-tenant).
 * @param userId - ID de `User` en sesión.
 * @param role - Rol actual del usuario.
 * @param campaignId - ID de la campaña.
 * @returns `true` si es súper admin, admin asignado a la campaña, o líder de esa campaña.
 */
export async function hasCampaignAccess(
  userId: string,
  role: UserRole,
  campaignId: string,
): Promise<boolean> {
  if (role === "SUPER_ADMIN") return true;

  if (role === "CAMPAIGN_ADMIN") {
    const link = await prisma.campaignAdmin.findUnique({
      where: {
        userId_campaignId: { userId, campaignId },
      },
    });
    return !!link;
  }

  if (role === "LEADER") {
    const profile = await prisma.leaderProfile.findFirst({
      where: { userId, campaignId },
    });
    return !!profile;
  }

  return false;
}

/**
 * Permiso específico para el mapa de calor: excluye a líderes aunque tengan `hasCampaignAccess`.
 * @param userId - ID de `User` en sesión.
 * @param role - Rol actual.
 * @param campaignId - Campaña a visualizar.
 * @returns `true` solo para `SUPER_ADMIN` o `CAMPAIGN_ADMIN` vinculado a la campaña.
 */
export async function canViewCampaignHeatmap(
  userId: string,
  role: UserRole,
  campaignId: string,
): Promise<boolean> {
  if (role === "SUPER_ADMIN") {
    const c = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { id: true } });
    return !!c;
  }
  if (role === "CAMPAIGN_ADMIN") {
    const link = await prisma.campaignAdmin.findUnique({
      where: { userId_campaignId: { userId, campaignId } },
    });
    return !!link;
  }
  return false;
}
