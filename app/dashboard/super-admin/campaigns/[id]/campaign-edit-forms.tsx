"use client";

import { useActionState } from "react";
import { assignCampaignAdminAction, updateCampaignAction } from "@/app/actions/super-admin";
import { initialDashboardFormState } from "@/lib/dashboard-form-state";

type Campaign = {
  id: string;
  name: string;
  slogan: string | null;
  description: string | null;
  aiContext: string | null;
  maxLeaders: number;
};

export function CampaignEditForm({ campaign }: { campaign: Campaign }) {
  const [state, formAction, isPending] = useActionState(
    updateCampaignAction.bind(null, campaign.id),
    initialDashboardFormState,
  );

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Nombre</label>
        <input
          name="name"
          required
          defaultValue={campaign.name}
          className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Slogan</label>
        <input
          name="slogan"
          defaultValue={campaign.slogan ?? ""}
          className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Descripción</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={campaign.description ?? ""}
          className="w-full max-w-xl rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Contexto IA</label>
        <textarea
          name="aiContext"
          maxLength={2000}
          rows={4}
          defaultValue={campaign.aiContext ?? ""}
          className="w-full max-w-xl rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Máximo de líderes</label>
        <input
          name="maxLeaders"
          type="number"
          min={1}
          max={5000}
          defaultValue={campaign.maxLeaders}
          className="w-full max-w-xs rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
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
        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-60"
      >
        {isPending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}

export function AssignAdminForm({ campaignId }: { campaignId: string }) {
  const [state, formAction, isPending] = useActionState(
    assignCampaignAdminAction.bind(null, campaignId),
    initialDashboardFormState,
  );

  return (
    <form action={formAction} className="mt-4 max-w-xl space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1">
          <label className="text-sm font-medium">Correo del administrador</label>
          <input
            name="email"
            type="email"
            required
            placeholder="admin@ejemplo.com"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <label className="text-sm font-medium">Contraseña (solo usuario nuevo)</label>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mín. 8 caracteres"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {isPending ? "…" : "Asignar"}
        </button>
      </div>
      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
