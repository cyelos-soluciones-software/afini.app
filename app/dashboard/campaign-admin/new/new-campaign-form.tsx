"use client";

import { useActionState } from "react";
import { createCampaignAsCampaignAdminAction } from "@/app/actions/onboarding";
import { initialDashboardFormState } from "@/lib/dashboard-form-state";
import {
  FREE_TIER_MAX_LEADERS_PER_CAMPAIGN,
  FREE_TIER_MAX_VOTERS_PER_CAMPAIGN,
} from "@/lib/plan-limits";

export function NewCampaignFromDashboardForm() {
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
        <label htmlFor="new-camp-name" className="text-sm font-medium text-[var(--foreground)]">
          Nombre de la campaña
        </label>
        <input
          id="new-camp-name"
          name="name"
          required
          placeholder="Ej. Juntos por el territorio"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="new-camp-slogan" className="text-sm font-medium text-[var(--foreground)]">
          Slogan (opcional)
        </label>
        <input
          id="new-camp-slogan"
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
        {isPending ? "Creando…" : "Crear campaña"}
      </button>
      <p className="text-center text-[11px] text-[var(--muted)]">
        Plan gratuito por campaña: hasta {FREE_TIER_MAX_LEADERS_PER_CAMPAIGN} líder y hasta{" "}
        {FREE_TIER_MAX_VOTERS_PER_CAMPAIGN} ciudadanos. Más capacidad: Premium con ventas (indica esta campaña al
        contactar).
      </p>
    </form>
  );
}
