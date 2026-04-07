/**
 * Contrato de estado para formularios del dashboard con `useActionState` y Server Actions.
 * @packageDocumentation
 */
export type DashboardActionState = {
  error: string | null;
  /** Mensaje para copiar (p. ej. invitación a líder); no persistir en servidor. */
  inviteMessage?: string | null;
};

/** Estado inicial antes de la primera enviada del formulario. */
export const initialDashboardFormState: DashboardActionState = { error: null };
