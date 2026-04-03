/**
 * Generación de libro Excel con respuestas agregadas por campaña (sin nombre ni teléfono del ciudadano).
 * Procesa votantes en lotes para memoria estable.
 * @packageDocumentation
 */
import ExcelJS from "exceljs";
import { parseChatLog } from "@/lib/chat-log";
import { leaderDisplayLabel } from "@/lib/leader-display";
import { prisma } from "@/lib/prisma";

const BATCH = 400;

/** Acorta texto de encabezado de columna para el XLSX. */
function truncateHeader(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

/** Etiqueta en español para `VotingIntention`. */
function intentionEsp(v: string): string {
  if (v === "YES") return "Sí";
  if (v === "NO") return "No";
  if (v === "MAYBE") return "Tal vez";
  return v;
}

/** Etiqueta en español para sentimiento IA. */
function sentimentEsp(s: string | null | undefined): string {
  if (s == null || s === "") return "";
  if (s === "positive") return "Positivo";
  if (s === "neutral") return "Neutral";
  if (s === "negative") return "Negativo";
  return s;
}

/**
 * Construye el buffer binario del archivo Excel y un nombre base de archivo seguro.
 * @param campaignId - ID de la campaña (acceso debe validarse antes en la ruta HTTP).
 * @returns `buffer` listo para `Response`, `filenameBase` derivado del slug.
 * @throws Si la campaña no existe.
 */
export async function buildParticipantResponsesXlsxBuffer(campaignId: string): Promise<{
  buffer: Buffer;
  filenameBase: string;
}> {
  const [campaign, questions] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { slug: true, name: true },
    }),
    prisma.question.findMany({
      where: { campaignId },
      orderBy: { sortOrder: "asc" },
      select: { id: true, questionText: true },
    }),
  ]);

  if (!campaign) {
    throw new Error("Campaña no encontrada");
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "Eco Cyelos";
  const ws = wb.addWorksheet("Respuestas", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  const baseHeaders = [
    "Ref. interna (id)",
    "Fecha (UTC)",
    "Intención de voto",
    "Zona (autorreportada)",
    "Latitud (WGS84)",
    "Longitud (WGS84)",
    "Canal / líder",
  ];
  const qHeaders = questions.map((q, i) => `P${i + 1}: ${truncateHeader(q.questionText, 100)}`);
  const tailHeaders = ["Conclusión IA", "Sentimiento IA", "Afinidad IA (0-1)"];
  ws.addRow([...baseHeaders, ...qHeaders, ...tailHeaders]);
  ws.getRow(1).font = { bold: true };

  let skip = 0;
  while (true) {
    const voters = await prisma.voter.findMany({
      where: { campaignId },
      orderBy: { createdAt: "asc" },
      skip,
      take: BATCH,
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
    });

    if (voters.length === 0) break;

    for (const v of voters) {
      const interaction = v.interactions[0];
      const parsed = interaction?.chatLog ? parseChatLog(interaction.chatLog) : null;
      const byQid = new Map((parsed?.qas ?? []).map((q) => [q.questionId, q.citizenAnswer]));
      const answerCols = questions.map((q) => byQid.get(q.id) ?? "");
      const conclusion = parsed?.conclusion ?? "";
      const sent = interaction?.sentiment ?? parsed?.metrics?.sentiment ?? "";
      const aff = interaction?.affinityScore ?? parsed?.metrics?.affinityScore ?? null;

      ws.addRow([
        v.id.slice(0, 12),
        v.createdAt.toISOString(),
        intentionEsp(v.votingIntention),
        v.neighborhood,
        v.latitude == null ? "" : v.latitude,
        v.longitude == null ? "" : v.longitude,
        leaderDisplayLabel(v.leader.personalInfo, v.leader.user.email),
        ...answerCols,
        conclusion,
        sentimentEsp(sent),
        aff == null ? "" : aff,
      ]);
    }

    skip += BATCH;
  }

  ws.columns.forEach((col, i) => {
    if (i === 0) col.width = 14;
    else if (i === 1) col.width = 24;
    else if (i < 7) col.width = 22;
    else if (i < 7 + questions.length) col.width = 48;
    else col.width = 28;
  });

  const buf = await wb.xlsx.writeBuffer();
  const safeSlug = campaign.slug.replace(/[^a-z0-9-_]/gi, "_").slice(0, 40);
  const filenameBase = `respuestas-${safeSlug}`;

  return {
    buffer: Buffer.from(buf),
    filenameBase,
  };
}
