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

// --- Súper administradores (CRUD, solo rol SUPER_ADMIN) ---

/** Lista usuarios con rol `SUPER_ADMIN` (sin hash de contraseña). */
export async function listSuperAdmins() {
  await requireRole("SUPER_ADMIN");
  return prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, createdAt: true },
  });
}

/** Detalle mínimo para edición; solo si el usuario es súper admin. */
export async function getSuperAdminForEdit(userId: string) {
  await requireRole("SUPER_ADMIN");
  return prisma.user.findFirst({
    where: { id: userId, role: "SUPER_ADMIN" },
    select: { id: true, email: true, createdAt: true },
  });
}

/**
 * Alta de otro súper administrador (correo único, contraseña ≥ 8).
 */
export async function createSuperAdminAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const session = await requireRole("SUPER_ADMIN");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Indica un correo electrónico válido." };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { error: "Ese correo ya está registrado." };
  }

  const hash = await bcrypt.hash(password, 12);
  const created = await prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      role: "SUPER_ADMIN",
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    email: session.user.email,
    action: "super_admin_create",
    entity: "User",
    entityId: created.id,
    metadata: { createdSuperAdminEmail: email },
  });

  revalidatePath("/dashboard/super-admin/super-users");
  return { error: null };
}

/**
 * Actualiza correo y/o contraseña de un súper admin.
 * Contraseña vacía = no cambiar.
 */
export async function updateSuperAdminAction(
  userId: string,
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const session = await requireRole("SUPER_ADMIN");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Indica un correo electrónico válido." };
  }

  const target = await prisma.user.findFirst({
    where: { id: userId, role: "SUPER_ADMIN" },
  });
  if (!target) {
    return { error: "Súper administrador no encontrado." };
  }

  if (email !== target.email) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) {
      return { error: "Ese correo ya está en uso por otra cuenta." };
    }
  }

  const data: { email: string; passwordHash?: string } = { email };
  if (password.length > 0) {
    if (password.length < 8) {
      return { error: "La nueva contraseña debe tener al menos 8 caracteres." };
    }
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  await writeAuditLog({
    userId: session.user.id,
    email: session.user.email,
    action: "super_admin_update",
    entity: "User",
    entityId: userId,
    metadata: { previousEmail: target.email, newEmail: email, passwordChanged: password.length > 0 },
  });

  revalidatePath("/dashboard/super-admin/super-users");
  revalidatePath(`/dashboard/super-admin/super-users/${userId}`);
  return { error: null };
}

/**
 * Elimina un súper admin. No permite borrar la última cuenta ni la propia sesión.
 * @remarks Tras éxito redirige al listado (no retorna).
 */
export async function deleteSuperAdminAction(
  userId: string,
  _prevState: DashboardActionState,
  _formData: FormData,
): Promise<DashboardActionState> {
  const session = await requireRole("SUPER_ADMIN");

  if (userId === session.user.id) {
    return { error: "No puedes eliminar tu propia cuenta." };
  }

  const total = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
  if (total <= 1) {
    return { error: "Debe existir al menos un súper administrador." };
  }

  const target = await prisma.user.findFirst({
    where: { id: userId, role: "SUPER_ADMIN" },
  });
  if (!target) {
    return { error: "Súper administrador no encontrado." };
  }

  await prisma.user.delete({ where: { id: userId } });

  await writeAuditLog({
    userId: session.user.id,
    email: session.user.email,
    action: "super_admin_delete",
    entity: "User",
    entityId: userId,
    metadata: { deletedEmail: target.email },
  });

  revalidatePath("/dashboard/super-admin/super-users");
  redirect("/dashboard/super-admin/super-users");
}
