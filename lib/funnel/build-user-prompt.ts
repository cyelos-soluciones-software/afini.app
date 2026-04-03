/**
 * Construcción del mensaje de usuario enviado a Gemini en el cierre del funnel.
 * @packageDocumentation
 */
import type { Campaign, Question } from "@prisma/client";

type QuestionWithAnswers = {
  question: Question;
  citizenAnswer: string;
};

/**
 * Ensambla el prompt en Markdown con datos de campaña, nombre del ciudadano y bloques pregunta/respuesta.
 * @param campaign - Metadatos de campaña y `aiContext` opcional (uso interno en el texto del prompt).
 * @param items - Preguntas ordenadas con la respuesta libre del ciudadano.
 * @param citizenRegisteredName - Nombre con el que se registró (personalización del tono de la IA).
 * @returns Texto único para `streamText` / modelo conversacional (no incluye instrucciones de sistema).
 */
export function buildFunnelUserPrompt(
  campaign: Pick<Campaign, "name" | "slogan" | "description" | "aiContext">,
  items: QuestionWithAnswers[],
  citizenRegisteredName: string,
): string {
  const citizenName = citizenRegisteredName.trim() || "el ciudadano";

  const header = [
    "## Datos de la campaña",
    `- Nombre: ${campaign.name}`,
    campaign.slogan ? `- Slogan: ${campaign.slogan}` : null,
    campaign.description ? `- Descripción: ${campaign.description}` : null,
    campaign.aiContext ? `\n## Contexto adicional para la evaluación (uso interno)\n${campaign.aiContext}` : null,
    "\n## Ciudadano (personalización obligatoria)",
    `- Nombre con el que se registró: ${citizenName}`,
    "Dirígete a esta persona por su nombre de forma natural y cercana (español neutro, respetuoso). Puedes usar el primer nombre si encaja con el registro, o el nombre completo si suena más natural. No repitas el nombre en cada frase: con saludarlo al inicio y quizá un cierre cálido basta.",
    "\n## Preguntas oficiales y respuestas del ciudadano",
    "Para cada pregunta encontrarás: la pregunta, la respuesta oficial de la campaña, notas internas opcionales, y la respuesta libre del ciudadano.",
  ]
    .filter(Boolean)
    .join("\n");

  const blocks = items.map(({ question, citizenAnswer }, i) => {
    const parts = [
      `### ${i + 1}. ${question.questionText}`,
      `**Respuesta oficial de la campaña:** ${question.officialAnswer}`,
      question.geminiContext ? `**Notas internas (contexto):** ${question.geminiContext}` : null,
      `**Respuesta del ciudadano:** ${citizenAnswer}`,
    ].filter(Boolean);
    return parts.join("\n\n");
  });

  return `${header}\n\n${blocks.join("\n\n")}\n\n## Tu tarea\nRedacta la conclusión siguiendo tu rol y reglas de sistema.`;
}
