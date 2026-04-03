/** Mensaje legible cuando falla fetch del stream (p. ej. JSON en el cuerpo del error). */
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
