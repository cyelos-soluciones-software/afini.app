/** Estado devuelto por acciones de formulario del dashboard (useActionState). */
export type DashboardActionState = {
  error: string | null;
};

export const initialDashboardFormState: DashboardActionState = { error: null };
