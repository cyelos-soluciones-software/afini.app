/**
 * Etiqueta visible del líder: `displayName` en JSON `personalInfo` si existe; si no, el correo.
 * @param personalInfo - JSON string opcional del perfil (`{ displayName?: string }`).
 * @param email - Correo del usuario líder (fallback).
 */
export function leaderDisplayLabel(personalInfo: string | null, email: string): string {
  if (personalInfo) {
    try {
      const o = JSON.parse(personalInfo) as { displayName?: string };
      if (o.displayName?.trim()) return o.displayName.trim();
    } catch {
      /* ignore */
    }
  }
  return email;
}
