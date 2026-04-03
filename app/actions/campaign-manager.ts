"use server";

/**
 * Administración operativa de campaña: preguntas, misiones, líderes, analíticas, mapa de calor y CTA de cierre.
 * Usa {@link hasCampaignAccess} salvo funciones que solo listan según rol.
 * @module app/actions/campaign-manager
 */
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { canViewCampaignHeatmap, hasCampaignAccess } from "@/lib/authz";
import type { DashboardActionState } from "@/lib/dashboard-form-state";
import { leaderDisplayLabel } from "@/lib/leader-display";
import { prisma } from "@/lib/prisma";

/**
 * Obtiene sesión y valida acceso a la campaña.
 * @internal
 * @throws {Error} `No autorizado` o `Sin acceso a esta campaña`.
 */
async function requireCampaignContext(campaignId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");
  const ok = await hasCampaignAccess(session.user.id, session.user.role, campaignId);
  if (!ok) throw new Error("Sin acceso a esta campaña");
  return session;
}

/** Lanza si el usuario no puede acceder a la campaña (útil en Server Components). */
export async function assertCampaignAccess(campaignId: string): Promise<void> {
  await requireCampaignContext(campaignId);
}

/** Metadatos mínimos de campaña si hay acceso; útil para títulos de página. */
export async function getCampaignNameIfAllowed(campaignId: string) {
  await assertCampaignAccess(campaignId);
  return prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, name: true, slug: true },
  });
}

/** Campañas visibles en el selector: todas para súper admin, asignadas para admin de campaña. */
export async function listAccessibleCampaigns() {
  const session = await auth();
  if (!session?.user?.id) return [];

  if (session.user.role === "SUPER_ADMIN") {
    return prisma.campaign.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });
  }

  if (session.user.role === "CAMPAIGN_ADMIN") {
    const links = await prisma.campaignAdmin.findMany({
      where: { userId: session.user.id },
      include: { campaign: { select: { id: true, name: true, slug: true } } },
    });
    return links.map((l) => l.campaign);
  }

  return [];
}

/** Ficha completa: preguntas, misiones, líderes y conteos. */
export async function getCampaignDetail(campaignId: string) {
  await requireCampaignContext(campaignId);
  return prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
      missions: { orderBy: { createdAt: "desc" }, take: 50 },
      leaders: {
        include: {
          user: { select: { email: true } },
          _count: { select: { voters: true } },
        },
      },
      _count: { select: { leaders: true, voters: true } },
    },
  });
}

/** Añade una pregunta del funnel con respuesta oficial y contexto opcional para IA. */
export async function createQuestionAction(
  campaignId: string,
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const session = await requireCampaignContext(campaignId);
  const questionText = String(formData.get("questionText") ?? "").trim();
  const officialAnswer = String(formData.get("officialAnswer") ?? "").trim();
  const geminiContext = String(formData.get("geminiContext") ?? "").trim().slice(0, 2000) || null;

  if (!questionText || !officialAnswer) {
    return { error: "Completa el texto de la pregunta y la respuesta oficial." };
  }

  const maxSort = await prisma.question.aggregate({
    where: { campaignId },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  await prisma.question.create({
    data: {
      campaignId,
      questionText,
      officialAnswer,
      geminiContext,
      sortOrder,
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    email: session.user.email,
    action: "question_create",
    entity: "Campaign",
    entityId: campaignId,
  });

  revalidatePath(`/dashboard/campaign-admin/${campaignId}`);
  return { error: null };
}

/** Elimina pregunta si pertenece a la campaña. */
export async function deleteQuestionAction(campaignId: string, questionId: string) {
  const session = await requireCampaignContext(campaignId);
  await prisma.question.deleteMany({
    where: { id: questionId, campaignId },
  });
  await writeAuditLog({
    userId: session.user.id,
    email: session.user.email,
    action: "question_delete",
    entity: "Campaign",
    entityId: campaignId,
  });
  revalidatePath(`/dashboard/campaign-admin/${campaignId}`);
}

/** Crea misión de difusión visible para líderes de la campaña. */
export async function createMissionAction(
  campaignId: string,
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const session = await requireCampaignContext(campaignId);
  const title = String(formData.get("title") ?? "").trim();
  const messageBody = String(formData.get("messageBody") ?? "").trim();

  if (!title || !messageBody) {
    return { error: "Indica título y texto de la misión." };
  }

  await prisma.mission.create({
    data: { campaignId, title, messageBody },
  });

  await writeAuditLog({
    userId: session.user.id,
    email: session.user.email,
    action: "mission_create",
    entity: "Campaign",
    entityId: campaignId,
  });

  revalidatePath(`/dashboard/campaign-admin/${campaignId}`);
  revalidatePath("/dashboard/leader");
  return { error: null };
}

/**
 * Alta de usuario `LEADER` y `LeaderProfile` con token de URL único.
 * @returns Error si correo duplicado o se supera `maxLeaders`.
 */
export async function createLeaderAction(
  campaignId: string,
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const session = await requireCampaignContext(campaignId);
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email || password.length < 8) {
    return { error: "Correo obligatorio y contraseña de al menos 8 caracteres." };
  }

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { error: "Campaña no encontrada." };

  const count = await prisma.leaderProfile.count({ where: { campaignId } });
  if (count >= campaign.maxLeaders) {
    return { error: `Límite de líderes alcanzado (${campaign.maxLeaders}).` };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ese correo ya está registrado; usa otro." };
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      role: "LEADER",
    },
  });

  const uniqueUrlToken = randomBytes(16).toString("hex");
  const personalInfo = displayName ? JSON.stringify({ displayName }) : null;

  await prisma.leaderProfile.create({
    data: {
      userId: user.id,
      campaignId,
      uniqueUrlToken,
      personalInfo,
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    email: session.user.email,
    action: "leader_create",
    entity: "Campaign",
    entityId: campaignId,
    metadata: { leaderEmail: email },
  });

  revalidatePath(`/dashboard/campaign-admin/${campaignId}`);
  return { error: null };
}

/** Orden fijo para informes (Sí → Tal vez → No). */
const INTENTION_ORDER = ["YES", "MAYBE", "NO"] as const;

/** @internal */
function intentionLabel(key: string): string {
  if (key === "YES") return "Sí";
  if (key === "NO") return "No";
  if (key === "MAYBE") return "Tal vez";
  return key;
}

/** Orden fijo sentimiento IA (clasificación en funnel). */
const SENTIMENT_ORDER = ["positive", "neutral", "negative"] as const;

/** @internal */
function sentimentLabel(key: string): string {
  if (key === "positive") return "Positivo";
  if (key === "neutral") return "Neutral";
  if (key === "negative") return "Negativo";
  return key;
}

/** Agregados para gráficos del dashboard de campaña. */
export type CampaignAnalytics = {
  totals: {
    voters: number;
    interactions: number;
    withSentiment: number;
    pendingSentiment: number;
  };
  intention: { name: string; value: number }[];
  byNeighborhood: { name: string; count: number }[];
  /** Votantes referidos por líder; `sharePct` = % sobre el total de votantes de la campaña. */
  byLeader: { name: string; count: number; sharePct: number }[];
  sentiment: { name: string; value: number }[];
  affinityAvg: number | null;
};

/** Consultas agregadas Prisma para Recharts (intención, barrio, líder, sentimiento, afinidad). */
export async function getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
  await requireCampaignContext(campaignId);

  const [
    totalVoters,
    totalInteractions,
    intentionGroups,
    neighborhoodGroups,
    leaders,
    sentimentGroups,
    pendingSentiment,
    affinityAgg,
  ] = await Promise.all([
    prisma.voter.count({ where: { campaignId } }),
    prisma.interaction.count({ where: { voter: { campaignId } } }),
    prisma.voter.groupBy({
      by: ["votingIntention"],
      where: { campaignId },
      _count: { _all: true },
    }),
    prisma.voter.groupBy({
      by: ["neighborhood"],
      where: { campaignId },
      _count: { _all: true },
    }),
    prisma.leaderProfile.findMany({
      where: { campaignId },
      include: {
        user: { select: { email: true } },
        _count: { select: { voters: true } },
      },
    }),
    prisma.interaction.groupBy({
      by: ["sentiment"],
      where: { voter: { campaignId }, sentiment: { not: null } },
      _count: { _all: true },
    }),
    prisma.interaction.count({
      where: { voter: { campaignId }, sentiment: null },
    }),
    prisma.interaction.aggregate({
      where: { voter: { campaignId }, affinityScore: { not: null } },
      _avg: { affinityScore: true },
    }),
  ]);

  const intentionMap = new Map(intentionGroups.map((g) => [g.votingIntention, g._count._all]));
  const intention = INTENTION_ORDER.filter((k) => (intentionMap.get(k) ?? 0) > 0).map((k) => ({
    name: intentionLabel(k),
    value: intentionMap.get(k) ?? 0,
  }));

  const byNeighborhood = neighborhoodGroups
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 12)
    .map((g) => ({
      name: g.neighborhood,
      count: g._count._all,
    }));

  const total = totalVoters;
  const byLeader = leaders
    .map((l) => {
      const count = l._count.voters;
      const sharePct = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
      return { name: leaderDisplayLabel(l.personalInfo, l.user.email), count, sharePct };
    })
    .sort((a, b) => b.count - a.count);

  const withSentiment = sentimentGroups.reduce((s, g) => s + g._count._all, 0);
  const sMap = new Map(
    sentimentGroups.map((g) => [g.sentiment as string, g._count._all]),
  );
  const sentiment: { name: string; value: number }[] = SENTIMENT_ORDER.filter(
    (k) => (sMap.get(k) ?? 0) > 0,
  ).map((k) => ({
    name: sentimentLabel(k),
    value: sMap.get(k) ?? 0,
  }));
  if (pendingSentiment > 0) {
    sentiment.push({ name: "Pendiente (sin sentimiento IA)", value: pendingSentiment });
  }

  const affinityAvg =
    affinityAgg._avg.affinityScore != null ? affinityAgg._avg.affinityScore : null;

  return {
    totals: {
      voters: totalVoters,
      interactions: totalInteractions,
      withSentiment,
      pendingSentiment,
    },
    intention,
    byNeighborhood,
    byLeader,
    sentiment,
    affinityAvg,
  };
}

/** Punto WGS84 para capas Leaflet. */
export type HeatmapGeoPoint = { lat: number; lng: number };

/**
 * Puntos agrupados por intención de voto para el mapa de calor.
 * @returns `null` si el usuario no tiene permiso ({@link canViewCampaignHeatmap}) o la campaña no existe.
 */
export async function getCampaignHeatmapData(campaignId: string): Promise<null | {
  campaignName: string;
  yes: HeatmapGeoPoint[];
  no: HeatmapGeoPoint[];
  maybe: HeatmapGeoPoint[];
  stats: {
    yes: number;
    no: number;
    maybe: number;
    withGeo: number;
    withoutGeo: number;
  };
}> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const allowed = await canViewCampaignHeatmap(session.user.id, session.user.role, campaignId);
  if (!allowed) return null;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { name: true },
  });
  if (!campaign) return null;

  const [votersWithGeo, withoutGeo] = await Promise.all([
    prisma.voter.findMany({
      where: {
        campaignId,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        latitude: true,
        longitude: true,
        votingIntention: true,
      },
    }),
    prisma.voter.count({
      where: {
        campaignId,
        OR: [{ latitude: null }, { longitude: null }],
      },
    }),
  ]);

  const yes: HeatmapGeoPoint[] = [];
  const no: HeatmapGeoPoint[] = [];
  const maybe: HeatmapGeoPoint[] = [];

  for (const v of votersWithGeo) {
    if (v.latitude == null || v.longitude == null) continue;
    const p = { lat: v.latitude, lng: v.longitude };
    if (v.votingIntention === "YES") yes.push(p);
    else if (v.votingIntention === "NO") no.push(p);
    else maybe.push(p);
  }

  return {
    campaignName: campaign.name,
    yes,
    no,
    maybe,
    stats: {
      yes: yes.length,
      no: no.length,
      maybe: maybe.length,
      withGeo: votersWithGeo.length,
      withoutGeo,
    },
  };
}

/** Texto opcional mostrado al ciudadano al finalizar el funnel (desde panel admin de campaña). */
export async function updateCampaignClosingCtaAction(
  campaignId: string,
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const session = await requireCampaignContext(campaignId);
  const closingCtaText = String(formData.get("closingCtaText") ?? "").trim().slice(0, 8000) || null;

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { closingCtaText },
  });

  await writeAuditLog({
    userId: session.user.id,
    email: session.user.email,
    action: "campaign_closing_cta_update",
    entity: "Campaign",
    entityId: campaignId,
  });

  revalidatePath(`/dashboard/campaign-admin/${campaignId}`);
  return { error: null };
}
