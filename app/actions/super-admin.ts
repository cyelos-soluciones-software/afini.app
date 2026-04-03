"use server";

/**
 * Acciones reservadas al rol `SUPER_ADMIN`: campañas globales y asignación de administradores de campaña.
 * @module app/actions/super-admin
 */
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/audit";
import { requireRole } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import type { DashboardActionState } from "@/lib/dashboard-form-state";
import { ensureUniqueCampaignSlug } from "@/lib/slug";

/** Lista todas las campañas con conteos de líderes y votantes. */
export async function listAllCampaigns() {
  await requireRole("SUPER_ADMIN");
  return prisma.campaign.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { leaders: true, voters: true } },
    },
  });
}

/** Detalle de campaña incluyendo administradores asignados. */
export async function getCampaignForSuperAdmin(campaignId: string) {
  await requireRole("SUPER_ADMIN");
  return prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      admins: { include: { user: { select: { email: true, id: true } } } },
    },
  });
}

/**
 * Crea campaña con slug único y redirige a su ficha en super-admin.
 * @remarks Ejecuta `redirect` tras éxito (no retorna al llamador en ese caso).
 */
export async function createCampaignAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const session = await requireRole("SUPER_ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const slogan = String(formData.get("slogan") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const aiContext = String(formData.get("aiContext") ?? "").trim().slice(0, 2000) || null;
  const maxLeaders = Math.max(1, Math.min(5000, Number(formData.get("maxLeaders") ?? 20)));

  if (!name) {
    return { error: "El nombre de la campaña es obligatorio." };
  }

  const slug = await ensureUniqueCampaignSlug(name);

  const c = await prisma.campaign.create({
    data: {
      name,
      slug,
      slogan,
      description,
      aiContext,
      maxLeaders,
      creatorId: session.user.id,
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    email: session.user.email,
    action: "campaign_create",
    entity: "Campaign",
    entityId: c.id,
    metadata: { slug: c.slug },
  });

  revalidatePath("/dashboard/super-admin");
  redirect(`/dashboard/super-admin/campaigns/${c.id}`);
}

/** Actualiza metadatos de campaña visibles en super-admin y panel de campaña. */
export async function updateCampaignAction(
  campaignId: string,
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const session = await requireRole("SUPER_ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const slogan = String(formData.get("slogan") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const aiContext = String(formData.get("aiContext") ?? "").trim().slice(0, 2000) || null;
  const closingCtaText = String(formData.get("closingCtaText") ?? "").trim().slice(0, 8000) || null;
  const maxLeaders = Math.max(1, Math.min(5000, Number(formData.get("maxLeaders") ?? 20)));

  if (!name) return { error: "El nombre de la campaña es obligatorio." };

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { name, slogan, description, aiContext, closingCtaText, maxLeaders },
  });

  await writeAuditLog({
    userId: session.user.id,
    email: session.user.email,
    action: "campaign_update",
    entity: "Campaign",
    entityId: campaignId,
  });

  revalidatePath("/dashboard/super-admin");
  revalidatePath(`/dashboard/super-admin/campaigns/${campaignId}`);
  revalidatePath(`/dashboard/campaign-admin/${campaignId}`);
  return { error: null };
}

/**
 * Vincula un usuario `CAMPAIGN_ADMIN` a la campaña (crea usuario si no existe).
 * @returns Estado de error descriptivo si el correo ya tiene rol incompatible.
 */
export async function assignCampaignAdminAction(
  campaignId: string,
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const session = await requireRole("SUPER_ADMIN");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    return { error: "Indica el correo del administrador." };
  }

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { error: "Campaña no encontrada." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === "SUPER_ADMIN") {
      return { error: "No puedes asignar un superadministrador como admin de campaña." };
    }
    if (existing.role === "LEADER") {
      return { error: "Ese correo pertenece a un líder; usa otro correo." };
    }
    if (existing.role !== "CAMPAIGN_ADMIN") {
      return { error: "Ese correo ya existe con otro rol." };
    }
  } else {
    if (password.length < 8) {
      return { error: "Para usuarios nuevos, la contraseña debe tener al menos 8 caracteres." };
    }
    const hash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        role: "CAMPAIGN_ADMIN",
      },
    });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { email } });

  await prisma.campaignAdmin.upsert({
    where: {
      userId_campaignId: { userId: user.id, campaignId },
    },
    create: { userId: user.id, campaignId },
    update: {},
  });

  await writeAuditLog({
    userId: session.user.id,
    email: session.user.email,
    action: "campaign_admin_assign",
    entity: "Campaign",
    entityId: campaignId,
    metadata: { assignedEmail: email },
  });

  revalidatePath(`/dashboard/super-admin/campaigns/${campaignId}`);
  return { error: null };
}
