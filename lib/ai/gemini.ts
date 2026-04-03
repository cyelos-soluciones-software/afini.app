import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Clave de API (solo servidor). Orden de preferencia alineado con documentación de Google AI y curl.
 * En curl usas: `-H 'X-goog-api-key: TU_CLAVE'` → misma clave aquí.
 */
export function getGeminiApiKey(): string | undefined {
  const raw =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_AI_API_KEY ??
    process.env.GOOGLE_API_KEY;
  if (raw == null) return undefined;
  const key = raw.trim().replace(/^["']|["']$/g, "");
  return key.length ? key : undefined;
}

export function requireGeminiApiKey(): string {
  const key = getGeminiApiKey();
  if (!key) {
    throw new Error(
      "Falta clave: define GOOGLE_GENERATIVE_AI_API_KEY o GEMINI_API_KEY en .env (sin espacios extra)",
    );
  }
  return key;
}

/** Mismo id que en REST: `.../models/gemini-flash-latest:generateContent` */
export function getGeminiModelId(): string {
  return (process.env.GEMINI_MODEL ?? "gemini-flash-latest").trim() || "gemini-flash-latest";
}

export function getGeminiModel(modelId?: string) {
  const id = modelId ?? getGeminiModelId();
  const apiKey = requireGeminiApiKey();
  const google = createGoogleGenerativeAI({ apiKey });
  return google(id);
}
