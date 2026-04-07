/**
 * Métricas agregadas para el panel de inicio (súper admin global o admin de campaña filtrado).
 */
import { Prisma } from "@prisma/client";
import { getAccessibleCampaignIdsForCampaignAdmin } from "@/lib/plan-limits";
import { prisma } from "@/lib/prisma";

export type MetricsRangeKey = "30d" | "1m" | "2m" | "3m" | "custom";

export type SuperAdminMetricsRange = {
  key: MetricsRangeKey;
  start: Date;
  end: Date;
  label: string;
  fromStr?: string;
  toStr?: string;
};

function endOfUtcDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

function startOfUtcDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

/**
 * Interpreta query params del dashboard (`range`, `from`, `to`).
 */
export function parseSuperAdminMetricsRange(
  sp: Record<string, string | string[] | undefined>,
): SuperAdminMetricsRange {
  const raw = typeof sp.range === "string" ? sp.range : "30d";
  const key = (["30d", "1m", "2m", "3m", "custom"].includes(raw) ? raw : "30d") as MetricsRangeKey;

  const fromParam = typeof sp.from === "string" ? sp.from : undefined;
  const toParam = typeof sp.to === "string" ? sp.to : undefined;

  if (key === "custom" && fromParam && toParam) {
    const start = startOfUtcDay(new Date(fromParam + "T12:00:00.000Z"));
    const end = endOfUtcDay(new Date(toParam + "T12:00:00.000Z"));
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start <= end) {
      return {
        key: "custom",
        start,
        end,
        label: `${fromParam} — ${toParam}`,
        fromStr: fromParam,
        toStr: toParam,
      };
    }
  }

  const end = endOfUtcDay(new Date());
  const start = new Date(end);
  const days = key === "1m" || key === "30d" ? 30 : key === "2m" ? 60 : key === "3m" ? 90 : 30;
  start.setUTCDate(start.getUTCDate() - days);
  start.setUTCHours(0, 0, 0, 0);

  const label =
    key === "30d"
      ? "Últimos 30 días"
      : key === "1m"
        ? "1 mes (30 días)"
        : key === "2m"
          ? "2 meses (60 días)"
          : key === "3m"
            ? "3 meses (90 días)"
            : "Últimos 30 días";

  return { key: key === "custom" ? "30d" : key, start, end, label };
}

export type VoterDayPoint = { day: string; count: number };

export type SuperAdminMetrics = {
  range: SuperAdminMetricsRange;
  campaignsNew: number;
  votersNew: number;
  leadersNew: number;
  campaignAdminsNew: number;
  votersByDay: VoterDayPoint[];
};

/**
 * Rellena días sin registros con count 0 para el gráfico.
 */
function fillDailySeries(
  start: Date,
  end: Date,
  rows: { day: Date; c: bigint }[],
): VoterDayPoint[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const d = r.day instanceof Date ? r.day : new Date(r.day);
    const key = d.toISOString().slice(0, 10);
    map.set(key, Number(r.c));
  }
  const out: VoterDayPoint[] = [];
  const cur = startOfUtcDay(new Date(start));
  const last = startOfUtcDay(new Date(end));
  while (cur <= last) {
    const key = cur.toISOString().slice(0, 10);
    out.push({ day: key, count: map.get(key) ?? 0 });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

export async function fetchSuperAdminMetrics(range: SuperAdminMetricsRange): Promise<SuperAdminMetrics> {
  const { start, end } = range;

  const [campaignsNew, votersNew, leadersNew, campaignAdminsNew, rawDays] = await Promise.all([
    prisma.campaign.count({
      where: { createdAt: { gte: start, lte: end } },
    }),
    prisma.voter.count({
      where: { createdAt: { gte: start, lte: end } },
    }),
    prisma.leaderProfile.count({
      where: { createdAt: { gte: start, lte: end } },
    }),
    prisma.campaignAdmin.count({
      where: { createdAt: { gte: start, lte: end } },
    }),
    prisma.$queryRaw<{ day: Date; c: bigint }[]>`
      SELECT (timezone('UTC', "createdAt"))::date AS day, COUNT(*)::bigint AS c
      FROM "Voter"
      WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
  ]);

  const votersByDay = fillDailySeries(start, end, rawDays);

  return {
    range,
    campaignsNew,
    votersNew,
    leadersNew,
    campaignAdminsNew,
    votersByDay,
  };
}

/**
 * Métricas de inicio para administrador de campaña: solo campañas donde es creador o está asignado en `CampaignAdmin`.
 */
export async function fetchCampaignAdminMetrics(
  userId: string,
  range: SuperAdminMetricsRange,
): Promise<SuperAdminMetrics> {
  const ids = await getAccessibleCampaignIdsForCampaignAdmin(userId);
  const { start, end } = range;

  if (ids.length === 0) {
    return {
      range,
      campaignsNew: 0,
      votersNew: 0,
      leadersNew: 0,
      campaignAdminsNew: 0,
      votersByDay: fillDailySeries(start, end, []),
    };
  }

  const [campaignsNew, votersNew, leadersNew, campaignAdminsNew, rawDays] = await Promise.all([
    prisma.campaign.count({
      where: { id: { in: ids }, createdAt: { gte: start, lte: end } },
    }),
    prisma.voter.count({
      where: { campaignId: { in: ids }, createdAt: { gte: start, lte: end } },
    }),
    prisma.leaderProfile.count({
      where: { campaignId: { in: ids }, createdAt: { gte: start, lte: end } },
    }),
    prisma.campaignAdmin.count({
      where: { campaignId: { in: ids }, createdAt: { gte: start, lte: end } },
    }),
    prisma.$queryRaw<{ day: Date; c: bigint }[]>`
      SELECT (timezone('UTC', "createdAt"))::date AS day, COUNT(*)::bigint AS c
      FROM "Voter"
      WHERE "campaignId" IN (${Prisma.join(ids)})
        AND "createdAt" >= ${start}
        AND "createdAt" <= ${end}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
  ]);

  return {
    range,
    campaignsNew,
    votersNew,
    leadersNew,
    campaignAdminsNew,
    votersByDay: fillDailySeries(start, end, rawDays),
  };
}
