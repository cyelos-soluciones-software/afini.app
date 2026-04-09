"use client";

import { useActionState, useRef, useEffect } from "react";
import {
  createLeaderAction,
  createMissionAction,
  createQuestionAction,
  updateCampaignMediaAction,
  updateCampaignClosingCtaAction,
} from "@/app/actions/campaign-manager";
import { CampaignMediaUploader } from "@/app/components/campaign-media-uploader";
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

export function NewLeaderForm({
  campaignId,
  leaderCount,
  maxLeaders,
  premiumUnlocked,
}: {
  campaignId: string;
  leaderCount: number;
  maxLeaders: number;
  premiumUnlocked: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    createLeaderAction.bind(null, campaignId),
    initialDashboardFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const atLimit = !premiumUnlocked && leaderCount >= maxLeaders;

  useEffect(() => {
    if (state.inviteMessage && !state.error) {
      formRef.current?.reset();
    }
  }, [state.inviteMessage, state.error]);

  return (
    <div className="space-y-3">
      {state.inviteMessage && !state.error ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-[var(--foreground)]">
          <p className="font-medium text-emerald-900 dark:text-emerald-100">Líder creado</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Copia el mensaje de invitación y envíalo por el canal que prefieras.
          </p>
          <textarea
            readOnly
            value={state.inviteMessage}
            rows={4}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(state.inviteMessage ?? "")}
            className="mt-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)]"
          >
            Copiar acceso
          </button>
        </div>
      ) : null}
      {atLimit ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
          No puedes añadir más líderes en plan gratuito en esta campaña (máx. {maxLeaders}). Revisa el aviso de límites
          arriba o contacta ventas para Premium (por campaña).
        </p>
      ) : (
        <form
          ref={formRef}
          action={formAction}
          className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
        >
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
      )}
    </div>
  );
}

export function ClosingCtaForm({
  campaignId,
  defaultClosingCtaText,
}: {
  campaignId: string;
  defaultClosingCtaText: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateCampaignClosingCtaAction.bind(null, campaignId),
    initialDashboardFormState,
  );

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-sm font-medium">Mensaje final del funnel</h3>
      <p className="text-xs text-[var(--muted)]">
        Texto opcional que verá el ciudadano después de la conclusión generada por IA: sitio web, enlaces a propuestas, información de interés. Las URLs que empiecen por http(s) se mostrarán como enlaces.
      </p>
      <textarea
        name="closingCtaText"
        maxLength={8000}
        rows={5}
        defaultValue={defaultClosingCtaText ?? ""}
        placeholder="Ej.: Conoce el programa completo: https://..."
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
        {isPending ? "Guardando…" : "Guardar mensaje final"}
      </button>
    </form>
  );
}

export function CampaignMediaForm({
  campaignId,
  bannerUrl,
  photoUrl,
}: {
  campaignId: string;
  bannerUrl: string | null;
  photoUrl: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateCampaignMediaAction.bind(null, campaignId),
    initialDashboardFormState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-sm font-medium text-[var(--foreground)]">Imagen de campaña (opcional)</h3>
      <p className="text-xs text-[var(--muted)]">
        Recomendado: banner 1600×600 (8:3) y foto 512×512 (cuadrada). Se muestran al inicio del funnel.
      </p>
      <div className="space-y-4">
        <CampaignMediaUploader
          campaignId={campaignId}
          kind="banner"
          label="Banner"
          hint="Imagen horizontal para el encabezado del funnel."
          currentUrl={bannerUrl}
          fieldName="bannerUrl"
        />
        <CampaignMediaUploader
          campaignId={campaignId}
          kind="photo"
          label="Fotografía"
          hint="Imagen principal (avatar) de la campaña."
          currentUrl={photoUrl}
          fieldName="photoUrl"
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
        {isPending ? "Guardando…" : "Guardar imágenes"}
      </button>
    </form>
  );
}
