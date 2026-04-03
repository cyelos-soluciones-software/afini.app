/**
 * Texto prearmado para que el líder comparta su enlace de funnel.
 * @param campaignName - Nombre visible de la campaña.
 * @param funnelUrl - URL absoluta del funnel del líder.
 */
export function leaderShareText(campaignName: string, funnelUrl: string): string {
  return `¡Participa en ${campaignName}! ${funnelUrl}`;
}

/**
 * Texto sugerido tras completar el funnel (ciudadano).
 * @param campaignName - Nombre de la campaña.
 * @param funnelUrl - URL del funnel (mismo enlace del líder o genérico según página).
 */
export function citizenShareText(campaignName: string, funnelUrl: string): string {
  return `¡Participé en ${campaignName}! ¿Te sumas? ${funnelUrl}`;
}

/** @returns URL `wa.me` con texto codificado. */
export function whatsappShareHref(shareText: string): string {
  return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
}

/** @returns URL de compartir de Telegram con URL y texto. */
export function telegramShareHref(funnelUrl: string, shareText: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(funnelUrl)}&text=${encodeURIComponent(shareText)}`;
}

/** @returns Diálogo compartir de Facebook con parámetro `u`. */
export function facebookShareHref(funnelUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(funnelUrl)}`;
}

/** Intent de publicación en X; el texto suele incluir la URL al final. */
export function xShareHref(shareText: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
}

/** Intent de publicación en Threads (incluir URL dentro del texto si aplica). */
export function threadsShareHref(shareText: string): string {
  return `https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`;
}
