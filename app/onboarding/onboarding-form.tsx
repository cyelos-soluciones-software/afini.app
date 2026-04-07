"use client";

import { useActionState } from "react";
import { createCampaignAsCampaignAdminAction } from "@/app/actions/onboarding";
import {
  FREE_TIER_MAX_LEADERS_PER_CAMPAIGN,
  FREE_TIER_MAX_VOTERS_PER_CAMPAIGN,
} from "@/lib/plan-limits";
import { initialDashboardFormState } from "@/lib/dashboard-form-state";

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(
    createCampaignAsCampaignAdminAction,
    initialDashboardFormState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
    >
      <div className="space-y-2">
        <label htmlFor="onb-name" className="text-sm font-medium text-[var(--foreground)]">
          Nombre de la campaña
        </label>
        <input
          id="onb-name"
          name="name"
          required
          placeholder="Ej. Juntos por el territorio"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="onb-slogan" className="text-sm font-medium text-[var(--foreground)]">
          Slogan (opcional)
        </label>
        <input
          id="onb-slogan"
          name="slogan"
          placeholder="Una línea que identifique el mensaje"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-60"
      >
        {isPending ? "Creando…" : "Crear campaña y continuar"}
      </button>
      <p className="text-center text-[11px] text-[var(--muted)]">
        Plan gratuito por campaña: hasta {FREE_TIER_MAX_LEADERS_PER_CAMPAIGN} líder y hasta{" "}
        {FREE_TIER_MAX_VOTERS_PER_CAMPAIGN} ciudadanos. Podrás crear más campañas desde el panel; Premium se acuerda por
        campaña con ventas.
      </p>
    </form>
  );
}
