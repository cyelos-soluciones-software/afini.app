"use client";

import { useActionState } from "react";
import { createCampaignAction } from "@/app/actions/super-admin";
import { initialDashboardFormState } from "@/lib/dashboard-form-state";

export function NewCampaignForm() {
  const [state, formAction, isPending] = useActionState(createCampaignAction, initialDashboardFormState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--foreground)]">Nombre</label>
        <input name="name" required className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--foreground)]">Slogan</label>
        <input name="slogan" className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--foreground)]">Descripción</label>
        <textarea name="description" rows={3} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--foreground)]">Contexto IA (máx. 2000 caracteres)</label>
        <textarea
          name="aiContext"
          maxLength={2000}
          rows={4}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--foreground)]">Máximo de líderes</label>
        <input
          name="maxLeaders"
          type="number"
          min={1}
          max={5000}
          defaultValue={20}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--foreground)]">Máximo de ciudadanos (funnel)</label>
        <p className="text-xs text-[var(--muted)]">
          Cupo en plan gratuito (puedes subirlo para campañas concretas). Por defecto 25.
        </p>
        <input
          name="maxVoters"
          type="number"
          min={1}
          max={10000000}
          defaultValue={25}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
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
        className="w-full rounded-lg bg-[var(--primary)] py-2.5 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-60"
      >
        {isPending ? "Creando…" : "Crear campaña"}
      </button>
    </form>
  );
}
