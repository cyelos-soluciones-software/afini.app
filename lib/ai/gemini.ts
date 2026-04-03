/**
 * Resolución de API key y modelo Google Generative AI para el AI SDK (solo servidor).
 * @packageDocumentation
 */
import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Lee la clave desde variables de entorno (varias aliases soportadas).
 * @returns Clave recortada o `undefined` si falta/vacía.
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

/**
 * @returns Clave API garantizada no vacía.
 * @throws {Error} Si no hay ninguna variable de entorno configurada.
 */
export function requireGeminiApiKey(): string {
  const key = getGeminiApiKey();
  if (!key) {
    throw new Error(
      "Falta clave: define GOOGLE_GENERATIVE_AI_API_KEY o GEMINI_API_KEY en .env (sin espacios extra)",
    );
  }
  return key;
}

/**
 * Identificador del modelo (mismo que en la URL REST de Google AI).
 * @default gemini-flash-latest
 */
export function getGeminiModelId(): string {
  return (process.env.GEMINI_MODEL ?? "gemini-flash-latest").trim() || "gemini-flash-latest";
}

/**
 * Instancia del modelo listo para `streamText` / `generateObject` del paquete `ai`.
 * @param modelId - Opcional; por defecto {@link getGeminiModelId}.
 */
export function getGeminiModel(modelId?: string) {
  const id = modelId ?? getGeminiModelId();
  const apiKey = requireGeminiApiKey();
  const google = createGoogleGenerativeAI({ apiKey });
  return google(id);
}
