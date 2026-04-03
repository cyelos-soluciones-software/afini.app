/**
 * Extrae un mensaje legible del error de `useCompletion` / fetch del stream del funnel.
 * @param err - Error típico del SDK con `message` que puede ser JSON serializado.
 * @returns Texto para mostrar al ciudadano (español cuando el backend envía `message`).
 */
export function parseFunnelStreamError(err: Error): string {
  const raw = err.message;
  try {
    const j = JSON.parse(raw) as { message?: string; retryAfter?: number };
    if (j.message && j.retryAfter != null) {
      return `${j.message} Espera ${j.retryAfter}s e inténtalo de nuevo.`;
    }
    if (j.message) return j.message;
  } catch {
    /* ignore */
  }
  return raw || "No se pudo generar la conclusión.";
}
