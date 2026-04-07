import { getPublicBaseUrl } from "@/lib/app-url";

/**
 * Texto de invitación para un líder (copiar y pegar en WhatsApp, etc.).
 */
export function buildLeaderInviteCopy(email: string, temporaryPassword: string): string {
  const base = getPublicBaseUrl().replace(/\/$/, "");
  return `¡Hola! Únete a mi campaña en afini.app. Tu enlace único para compartir está listo. Entra a ${base}/login con tu correo y esta clave temporal: ${temporaryPassword}`;
}
