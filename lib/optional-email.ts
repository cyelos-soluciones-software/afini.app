/**
 * Validación de correo opcional en el funnel ciudadano (formato por regex; sin unicidad).
 * @packageDocumentation
 */

/**
 * Patrón razonable para correos típicos (local@dominio.tld).
 * @remarks No intenta cubrir todos los RFC; basta para datos opcionales de contacto.
 */
export const OPTIONAL_EMAIL_REGEX =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const MAX_LEN = 254;

/**
 * @param raw - Valor del campo; vacío u opcional equivale a sin correo.
 * @returns `undefined` si no hay correo; cadena normalizada si es válida.
 */
export function parseOptionalEmail(raw: unknown): { ok: true; value: string | undefined } | { ok: false; message: string } {
  if (raw === undefined || raw === null) {
    return { ok: true, value: undefined };
  }
  const s = String(raw).trim();
  if (s.length === 0) {
    return { ok: true, value: undefined };
  }
  if (s.length > MAX_LEN) {
    return { ok: false, message: "El correo no puede superar 254 caracteres." };
  }
  if (!OPTIONAL_EMAIL_REGEX.test(s)) {
    return { ok: false, message: "Indica un correo electrónico válido o déjalo vacío." };
  }
  return { ok: true, value: s };
}
