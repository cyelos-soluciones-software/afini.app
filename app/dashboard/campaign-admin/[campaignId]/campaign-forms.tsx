"use client";

import { useActionState } from "react";
import { createLeaderAction, createMissionAction, createQuestionAction } from "@/app/actions/campaign-manager";
import { initialDashboardFormState } from "@/lib/dashboard-form-state";

export function NewQuestionForm({ campaignId }: { campaignId: string }) {
  const [state, formAction, isPending] = useActionState(
    createQuestionAction.bind(null, campaignId),
    initialDashboardFormState,
  );

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-sm font-medium">Nueva pregunta</h3>
      <textarea
        name="questionText"
        required
        placeholder="Texto de la pregunta"
        rows={2}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
      />
      <textarea
        name="officialAnswer"
        required
        placeholder="Respuesta oficial de la campaña"
        rows={2}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
      />
      <textarea
        name="geminiContext"
        maxLength={2000}
        placeholder="Contexto extra para Gemini (opcional)"
        rows={2}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
      />
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
        {isPending ? "Añadiendo…" : "Añadir pregunta"}
      </button>
    </form>
  );
}

export function NewMissionForm({ campaignId }: { campaignId: string }) {
  const [state, formAction, isPending] = useActionState(
    createMissionAction.bind(null, campaignId),
    initialDashboardFormState,
  );

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <input
        name="title"
        required
        placeholder="Título de la misión"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
      />
      <textarea
        name="messageBody"
        required
        placeholder="Texto que copiarán los líderes a WhatsApp"
        rows={4}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
      />
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
        {isPending ? "Creando…" : "Crear misión"}
      </button>
    </form>
  );
}

export function NewLeaderForm({ campaignId }: { campaignId: string }) {
  const [state, formAction, isPending] = useActionState(
    createLeaderAction.bind(null, campaignId),
    initialDashboardFormState,
  );

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-sm text-[var(--muted)]">Crea un usuario con rol líder y enlace único de referido.</p>
      <input
        name="email"
        type="email"
        required
        placeholder="correo@ejemplo.com"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="Contraseña (mín. 8)"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
      />
      <input
        name="displayName"
        placeholder="Nombre para mostrar (opcional)"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
      />
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
        {isPending ? "Creando…" : "Crear líder"}
      </button>
    </form>
  );
}
