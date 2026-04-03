import { generateObject, streamText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import { getGeminiApiKey, getGeminiModel, getGeminiModelId } from "@/lib/ai/gemini";
import { buildFunnelUserPrompt } from "@/lib/funnel/build-user-prompt";
import { FUNNEL_SYSTEM_PROMPT } from "@/lib/prompts/funnel-system";
import { prisma } from "@/lib/prisma";
import { checkFunnelRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  /** Enviado por useCompletion del AI SDK; no se usa en la lógica del funnel. */
  prompt: z.string().optional(),
  campaignSlug: z.string().min(1).max(200),
  leaderToken: z.string().min(1).max(200),
  voter: z.object({
    name: z.string().min(1).max(200),
    phone: z.string().min(7).max(40),
    neighborhood: z.string().min(1).max(300),
    votingIntention: z.enum(["YES", "NO", "MAYBE"]),
  }),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        answer: z.string().min(1).max(8000),
      }),
    )
    .min(1),
});

function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

export async function POST(req: Request) {
  const rl = await checkFunnelRateLimit(req);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limit", message: "Demasiadas solicitudes. Espera un momento.", retryAfter: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  if (!getGeminiApiKey()) {
    return NextResponse.json(
      { error: "gemini_not_configured", message: "Configura GOOGLE_GENERATIVE_AI_API_KEY o GEMINI_API_KEY" },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", message: parsed.error.message }, { status: 400 });
  }

  const { campaignSlug, leaderToken, voter, answers } = parsed.data;
  const ip = clientIp(req);
  const userAgent = req.headers.get("user-agent");

  const leader = await prisma.leaderProfile.findFirst({
    where: {
      uniqueUrlToken: leaderToken,
      campaign: { slug: campaignSlug },
    },
    include: {
      campaign: {
        include: {
          questions: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!leader) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const requiredIds = new Set(leader.campaign.questions.map((q) => q.id));
  const answeredIds = new Set(answers.map((a) => a.questionId));
  if (requiredIds.size === 0) {
    return NextResponse.json({ error: "no_questions" }, { status: 400 });
  }
  if (requiredIds.size !== answeredIds.size || [...requiredIds].some((id) => !answeredIds.has(id))) {
    return NextResponse.json({ error: "incomplete_answers" }, { status: 400 });
  }

  const answerById = new Map(answers.map((a) => [a.questionId, a.answer]));
  const items = leader.campaign.questions.map((question) => ({
    question,
    citizenAnswer: answerById.get(question.id) ?? "",
  }));

  const userPrompt = buildFunnelUserPrompt(leader.campaign, items);

  const metricsSchema = z.object({
    affinityScore: z.number().min(0).max(1),
    sentiment: z.enum(["positive", "neutral", "negative"]),
  });

  const voterPayload = voter;
  const leaderRef = leader;
  const itemsRef = items;

  const result = streamText({
    model: getGeminiModel(),
    system: FUNNEL_SYSTEM_PROMPT,
    prompt: userPrompt,
    onError: ({ error }) => {
      console.error("[funnel/stream] streamText error", error);
    },
    onFinish: async ({ text }) => {
      const conclusion = text.trim();
      if (!conclusion) {
        await writeAuditLog({
          action: "funnel_empty_conclusion",
          entity: "Campaign",
          entityId: leaderRef.campaignId,
          metadata: { leaderProfileId: leaderRef.id },
          ip,
          userAgent,
        });
        return;
      }

      let affinityScore: number | null = null;
      let sentiment: string | null = null;
      try {
        const citizenSummary = itemsRef
          .map((i) => `P: ${i.question.questionText}\nR ciudadano: ${i.citizenAnswer}`)
          .join("\n\n");
        const { object } = await generateObject({
          model: getGeminiModel(),
          schema: metricsSchema,
          prompt: `Eres un clasificador. Devuelve SOLO el objeto JSON según el esquema.
Evalúa qué tan alineado está el ciudadano con las respuestas oficiales (affinityScore 0-1) y el sentimiento general (positive/neutral/negative).

Conclusión del asistente:
${conclusion}

Respuestas del ciudadano:
${citizenSummary}`,
        });
        affinityScore = object.affinityScore;
        sentiment = object.sentiment;
      } catch {
        // opcional
      }

      const chatLog: Prisma.InputJsonValue = {
        version: 1,
        campaignId: leaderRef.campaignId,
        leaderId: leaderRef.id,
        qas: itemsRef.map((i) => ({
          questionId: i.question.id,
          questionText: i.question.questionText,
          officialAnswer: i.question.officialAnswer,
          geminiContext: i.question.geminiContext,
          citizenAnswer: i.citizenAnswer,
        })),
        conclusion,
        metrics: { affinityScore, sentiment },
      };

      try {
        await prisma.voter.create({
          data: {
            leaderId: leaderRef.id,
            campaignId: leaderRef.campaignId,
            name: voterPayload.name.trim(),
            phone: voterPayload.phone.trim(),
            neighborhood: voterPayload.neighborhood.trim(),
            votingIntention: voterPayload.votingIntention,
            interactions: {
              create: {
                chatLog,
                affinityScore,
                sentiment,
              },
            },
          },
        });
        await writeAuditLog({
          action: "funnel_voter_created",
          entity: "Campaign",
          entityId: leaderRef.campaignId,
          metadata: { leaderProfileId: leaderRef.id, model: getGeminiModelId() },
          ip,
          userAgent,
        });
      } catch (e) {
        console.error("[funnel/stream] persist failed", e);
        await writeAuditLog({
          action: "funnel_persist_failed",
          entity: "Campaign",
          entityId: leaderRef.campaignId,
          metadata: { error: String(e) },
          ip,
          userAgent,
        });
      }
    },
  });

  return result.toTextStreamResponse({
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
