/**
 * Tipos y constantes de paginación para la tabla de respuestas de participantes (sin datos de contacto sensibles).
 * @packageDocumentation
 */
export const PARTICIPANT_RESPONSES_DEFAULT_PAGE_SIZE = 25;
export const PARTICIPANT_RESPONSES_MAX_PAGE_SIZE = 50;

export type ParticipantResponseRow = {
  /** Id técnico (clave en tabla; no es nombre/teléfono del ciudadano). */
  id: string;
  /** Prefijo visible para correlación con exportaciones. */
  refId: string;
  submittedAt: Date;
  votingIntentionLabel: string;
  /** Barrio/zona autorreportada (no nombre ni contacto). */
  neighborhood: string;
  /** WGS84 desde el navegador, si el ciudadano autorizó. */
  latitude: number | null;
  longitude: number | null;
  leaderLabel: string;
  qaPairs: { questionId: string; questionText: string; answer: string }[];
  conclusion: string | null;
  sentimentLabel: string | null;
  affinityScore: number | null;
};
