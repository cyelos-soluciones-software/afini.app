/**
 * Parseo defensivo del JSON almacenado en `Interaction.chatLog` (funnel).
 * @packageDocumentation
 */
export type ParsedChatLog = {
  qas: Array<{
    questionId: string;
    questionText: string;
    citizenAnswer: string;
  }>;
  conclusion: string | null;
  metrics: {
    affinityScore?: number | null;
    sentiment?: string | null;
  };
};

/**
 * @param json - Valor leído de Prisma (objeto o desconocido).
 * @returns Estructura tipada o `null` si no es un objeto válido.
 */
export function parseChatLog(json: unknown): ParsedChatLog | null {
  if (!json || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;
  const qasRaw = o.qas;
  const qas: ParsedChatLog["qas"] = [];
  if (Array.isArray(qasRaw)) {
    for (const item of qasRaw) {
      if (!item || typeof item !== "object") continue;
      const q = item as Record<string, unknown>;
      qas.push({
        questionId: String(q.questionId ?? ""),
        questionText: String(q.questionText ?? ""),
        citizenAnswer: String(q.citizenAnswer ?? ""),
      });
    }
  }
  const conclusion = typeof o.conclusion === "string" ? o.conclusion : null;
  let metrics: ParsedChatLog["metrics"] = {};
  if (o.metrics && typeof o.metrics === "object") {
    const m = o.metrics as Record<string, unknown>;
    metrics = {
      affinityScore: typeof m.affinityScore === "number" ? m.affinityScore : null,
      sentiment: typeof m.sentiment === "string" ? m.sentiment : null,
    };
  }
  return { qas, conclusion, metrics };
}
