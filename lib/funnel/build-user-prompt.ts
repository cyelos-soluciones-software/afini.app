import type { Campaign, Question } from "@prisma/client";

type QuestionWithAnswers = {
  question: Question;
  citizenAnswer: string;
};

export function buildFunnelUserPrompt(
  campaign: Pick<Campaign, "name" | "slogan" | "description" | "aiContext">,
  items: QuestionWithAnswers[],
): string {
  const header = [
    "## Datos de la campaña",
    `- Nombre: ${campaign.name}`,
    campaign.slogan ? `- Slogan: ${campaign.slogan}` : null,
    campaign.description ? `- Descripción: ${campaign.description}` : null,
    campaign.aiContext ? `\n## Contexto adicional para la evaluación (uso interno)\n${campaign.aiContext}` : null,
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
