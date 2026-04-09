"use server";

/**
 * Primera campaña para administradores que entran con Google (PLG).
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/audit";
import { requireRole } from "@/lib/auth-session";
import {
  FREE_TIER_MAX_LEADERS_PER_CAMPAIGN,
  FREE_TIER_MAX_VOTERS_PER_CAMPAIGN,
} from "@/lib/plan-limits";
import { prisma } from "@/lib/prisma";
import { ensureUniqueCampaignSlug } from "@/lib/slug";
import type { DashboardActionState } from "@/lib/dashboard-form-state";

/**
 * Crea una campaña como administrador (onboarding o “nueva campaña” en el panel).
 * Plan gratuito: 1 líder y cupo de ciudadanos por defecto por campaña; Premium se negocia por campaña.
 */
export async function createCampaignAsCampaignAdminAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const session = await requireRole("CAMPAIGN_ADMIN");

  const name = String(formData.get("name") ?? "").trim();
  const slogan = String(formData.get("slogan") ?? "").trim() || null;

  if (!name) {
    return { error: "El nombre de la campaña es obligatorio." };
  }

  const slug = await ensureUniqueCampaignSlug(name);

  const campaign = await prisma.campaign.create({
    data: {
      name,
      slug,
      slogan,
      maxLeaders: FREE_TIER_MAX_LEADERS_PER_CAMPAIGN,
      maxVoters: FREE_TIER_MAX_VOTERS_PER_CAMPAIGN,
      bannerUrl: null,
      photoUrl: null,
      creatorId: session.user.id,
      admins: {
        create: { userId: session.user.id },
      },
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    email: session.user.email,
    action: "campaign_admin_create_campaign",
    entity: "Campaign",
    entityId: campaign.id,
    metadata: { slug: campaign.slug },
  });

  revalidatePath("/dashboard/campaign-admin");
  revalidatePath("/onboarding");
  redirect(`/dashboard/campaign-admin/${campaign.id}`);
}

/** @deprecated Usar {@link createCampaignAsCampaignAdminAction}; se mantiene el nombre para formularios existentes. */
export async function completeOnboardingAction(
  prev: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  return createCampaignAsCampaignAdminAction(prev, formData);
}
