"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createSuperAdminAction,
  deleteSuperAdminAction,
  updateSuperAdminAction,
} from "@/app/actions/super-admin";
import { initialDashboardFormState } from "@/lib/dashboard-form-state";

export function CreateSuperAdminForm() {
  const [state, formAction, pending] = useActionState(createSuperAdminAction, initialDashboardFormState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Nuevo administrador global</h2>
      <p className="text-sm text-[var(--muted)]">
        Podrá gestionar todas las campañas y dar de alta más personas con el mismo nivel de acceso.
      </p>
      <div className="space-y-2">
        <label htmlFor="new-super-email" className="block text-sm font-medium text-[var(--foreground)]">
          Correo electrónico
        </label>
        <input
          id="new-super-email"
          name="email"
          type="email"
          required
          autoComplete="off"
          className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--primary)] focus:ring-2"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="new-super-password" className="block text-sm font-medium text-[var(--foreground)]">
          Contraseña inicial
        </label>
        <input
          id="new-super-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--primary)] focus:ring-2"
        />
        <p className="text-xs text-[var(--muted)]">Mínimo 8 caracteres.</p>
      </div>
      {state.error ? (
        <p className="text-sm font-medium text-[var(--destructive)]" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-[48px] w-full rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-105 disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear cuenta"}
      </button>
    </form>
  );
}

export function UpdateSuperAdminForm({
  userId,
  currentEmail,
}: {
  userId: string;
  currentEmail: string;
}) {
  const bound = updateSuperAdminAction.bind(null, userId);
  const [state, formAction, pending] = useActionState(bound, initialDashboardFormState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Datos de la cuenta</h2>
      <div className="space-y-2">
        <label htmlFor="edit-super-email" className="block text-sm font-medium text-[var(--foreground)]">
          Correo electrónico
        </label>
        <input
          id="edit-super-email"
          name="email"
          type="email"
          required
          defaultValue={currentEmail}
          autoComplete="email"
          className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--primary)] focus:ring-2"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="edit-super-password" className="block text-sm font-medium text-[var(--foreground)]">
          Nueva contraseña
        </label>
        <input
          id="edit-super-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Dejar vacío para no cambiar"
          className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--primary)] focus:ring-2"
        />
        <p className="text-xs text-[var(--muted)]">Solo completa este campo si quieres restablecer la contraseña.</p>
      </div>
      {state.error ? (
        <p className="text-sm font-medium text-[var(--destructive)]" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="min-h-[48px] rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-105 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        <Link
          href="/dashboard/super-admin/super-users"
          className="inline-flex min-h-[48px] items-center rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]/40"
        >
          Volver al listado
        </Link>
      </div>
    </form>
  );
}

export function DeleteSuperAdminForm({
  userId,
  email,
  disabled,
}: {
  userId: string;
  email: string;
  disabled: boolean;
}) {
  const bound = deleteSuperAdminAction.bind(null, userId);
  const [state, formAction, pending] = useActionState(bound, initialDashboardFormState);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-[var(--destructive)]/25 bg-[var(--destructive)]/[0.06] p-6"
    >
      <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Zona de riesgo</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Se eliminará el usuario <span className="font-medium text-[var(--foreground)]">{email}</span>. Esta acción no
        se puede deshacer.
      </p>
      {state.error ? (
        <p className="mt-3 text-sm font-medium text-[var(--destructive)]" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={disabled || pending}
        className="mt-4 min-h-[48px] rounded-xl border border-[var(--destructive)]/35 bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--destructive)] transition hover:bg-[var(--destructive)]/8 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Eliminando…" : "Eliminar cuenta"}
      </button>
    </form>
  );
}

/** Botón eliminar en filas de tabla (redirige al listado si tiene éxito). */
export function DeleteSuperAdminInline({ userId, disabled }: { userId: string; disabled: boolean }) {
  const bound = deleteSuperAdminAction.bind(null, userId);
  const [state, formAction, pending] = useActionState(bound, initialDashboardFormState);

  return (
    <form action={formAction} className="inline-flex flex-col items-end gap-1">
      <button
        type="submit"
        disabled={disabled || pending}
        className="text-sm font-medium text-[var(--destructive)] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "…" : "Eliminar"}
      </button>
      {state.error ? (
        <span className="max-w-[140px] text-right text-[10px] text-[var(--destructive)]">{state.error}</span>
      ) : null}
    </form>
  );
}
