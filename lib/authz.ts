import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Comprueba si el usuario puede leer/escribir datos de una campaña (control de acceso multi-tenant).
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
