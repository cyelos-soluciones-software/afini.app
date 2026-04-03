import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";

/**
 * E.164: + y entre 7 y 15 dígitos (primer dígito del plan de marcado 1–9).
 * Refuerzo junto a libphonenumber para datos críticos.
 */
export const E164_REGEX = /^\+[1-9]\d{6,14}$/;

/**
 * Comprueba si la cadena cumple el patrón E.164 estricto (complemento a libphonenumber).
 * @param value - Teléfono en formato internacional, p. ej. `+573001234567`.
 * @returns `true` si coincide con {@link E164_REGEX}.
 */
export function isStrictE164Format(value: string): boolean {
  return E164_REGEX.test(value.trim());
}

/**
 * Valida con libphonenumber, normaliza a E.164 y aplica {@link isStrictE164Format} al resultado.
 * @param input - Entrada del usuario (puede incluir espacios; se hace trim).
 * @returns Discriminante `ok`: si es `true`, `e164` listo para persistir; si `false`, `message` para mostrar al usuario.
 */
export function parseToE164(input: string): { ok: true; e164: string } | { ok: false; message: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, message: "El teléfono es obligatorio." };
  }
  if (!isValidPhoneNumber(trimmed)) {
    return { ok: false, message: "Número de teléfono no válido. Incluye código de país." };
  }
  try {
    const parsed = parsePhoneNumber(trimmed);
    const e164 = parsed.format("E.164");
    if (!isStrictE164Format(e164)) {
      return { ok: false, message: "El teléfono no cumple el formato internacional esperado." };
    }
    return { ok: true, e164 };
  } catch {
    return { ok: false, message: "No se pudo interpretar el número de teléfono." };
  }
}

/** Reexport de libphonenumber-js para validación en cliente/servidor. */
export { isValidPhoneNumber };
