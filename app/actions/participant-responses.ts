"use server";

/**
 * Lectura paginada de respuestas de participantes para el dashboard (sin exponer nombre/teléfono en filas).
 * @module app/actions/participant-responses
 */
import { assertCampaignAccess } from "@/app/actions/campaign-manager";
import { parseChatLog } from "@/lib/chat-log";
import { leaderDisplayLabel } from "@/lib/leader-display";
import {
  PARTICIPANT_RESPONSES_DEFAULT_PAGE_SIZE,
  PARTICIPANT_RESPONSES_MAX_PAGE_SIZE,
  type ParticipantResponseRow,
} from "@/lib/participant-responses-types";
import { prisma } from "@/lib/prisma";

/** @internal */
function votingIntentionLabel(v: string): string {
  if (v === "YES") return "Sí";
  if (v === "NO") return "No";
  if (v === "MAYBE") return "Tal vez";
  return v;
}

/** @internal */
function formatSentimentLabel(s: string | null | undefined): string | null {
  if (s == null || s === "") return null;
  if (s === "positive") return "Positivo";
  if (s === "neutral") return "Neutral";
  if (s === "negative") return "Negativo";
  return s;
}

/**
 * Lista votantes de la campaña con última interacción parseada (preguntas, conclusión, métricas).
 * @param campaignId - Campaña (debe haberse validado acceso con {@link assertCampaignAccess}).
 * @param page - Página 1-based.
 * @param pageSize - Tamaño de página (acotado por {@link PARTICIPANT_RESPONSES_MAX_PAGE_SIZE}).
 */
export async function getParticipantResponsesPage(
  campaignId: string,
  page: number,
  pageSize: number = PARTICIPANT_RESPONSES_DEFAULT_PAGE_SIZE,
): Promise<{
  rows: ParticipantResponseRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  await assertCampaignAccess(campaignId);
  const take = Math.min(Math.max(1, pageSize), PARTICIPANT_RESPONSES_MAX_PAGE_SIZE);
  const p = Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1);
  const skip = (p - 1) * take;

  const [total, voters] = await Promise.all([
    prisma.voter.count({ where: { campaignId } }),
    prisma.voter.findMany({
      where: { campaignId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        createdAt: true,
        votingIntention: true,
        neighborhood: true,
        latitude: true,
        longitude: true,
        leader: {
          select: { personalInfo: true, user: { select: { email: true } } },
        },
        interactions: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { chatLog: true, affinityScore: true, sentiment: true },
        },
      },
    }),
  ]);

  const rows: ParticipantResponseRow[] = voters.map((v) => {
    const interaction = v.interactions[0];
    const parsed = interaction?.chatLog ? parseChatLog(interaction.chatLog) : null;
    const qaPairs =
      parsed?.qas.map((q) => ({
        questionId: q.questionId,
        questionText: q.questionText,
        answer: q.citizenAnswer,
      })) ?? [];
    const sentimentRaw = interaction?.sentiment ?? parsed?.metrics?.sentiment ?? null;
    const affinityRaw = interaction?.affinityScore ?? parsed?.metrics?.affinityScore ?? null;
    return {
      id: v.id,
      refId: `${v.id.slice(0, 8)}…`,
      submittedAt: v.createdAt,
      votingIntentionLabel: votingIntentionLabel(v.votingIntention),
      neighborhood: v.neighborhood,
      latitude: v.latitude,
      longitude: v.longitude,
      leaderLabel: leaderDisplayLabel(v.leader.personalInfo, v.leader.user.email),
      qaPairs,
      conclusion: parsed?.conclusion ?? null,
      sentimentLabel: formatSentimentLabel(sentimentRaw),
      affinityScore: affinityRaw,
    };
  });

  const totalPages = total === 0 ? 1 : Math.ceil(total / take);

  return {
    rows,
    total,
    page: p,
    pageSize: take,
    totalPages,
  };
}
