"use client";

import { useActionState, type ReactNode } from "react";
import { assignCampaignAdminAction, updateCampaignAction } from "@/app/actions/super-admin";
import { CampaignFunnelThemeForm } from "@/app/components/campaign-funnel-theme-form";
import { CampaignMediaUploader } from "@/app/components/campaign-media-uploader";
import { initialDashboardFormState } from "@/lib/dashboard-form-state";

type Campaign = {
  id: string;
  name: string;
  slogan: string | null;
  description: string | null;
  aiContext: string | null;
  closingCtaText: string | null;
  maxLeaders: number;
  maxVoters: number;
  bannerUrl: string | null;
  photoUrl: string | null;
  funnelTheme: unknown;
};

const fieldClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25";

function FieldGroup({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--foreground)]">
        {label}
      </label>
      {hint ? <p className="text-xs leading-relaxed text-[var(--muted)]">{hint}</p> : null}
      {children}
    </div>
  );
}

export function CampaignEditForm({ campaign }: { campaign: Campaign }) {
  const [state, formAction, isPending] = useActionState(
    updateCampaignAction.bind(null, campaign.id),
    initialDashboardFormState,
  );

  return (
    <div className="mt-6 flex max-w-3xl flex-col gap-8">
    <form action={formAction} className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <FieldGroup label="Nombre" htmlFor="camp-name">
          <input id="camp-name" name="name" required defaultValue={campaign.name} className={fieldClass} />
        </FieldGroup>
        <FieldGroup label="Slogan" htmlFor="camp-slogan">
          <input id="camp-slogan" name="slogan" defaultValue={campaign.slogan ?? ""} className={fieldClass} />
        </FieldGroup>
        <FieldGroup label="Descripción" htmlFor="camp-desc">
          <textarea
            id="camp-desc"
            name="description"
            rows={3}
            defaultValue={campaign.description ?? ""}
            className={`${fieldClass} min-h-[5rem] resize-y`}
          />
        </FieldGroup>
        <FieldGroup
          label="Contexto IA"
          htmlFor="camp-ai"
          hint="Texto de apoyo para los modelos (máx. 2000 caracteres en formulario)."
        >
          <textarea
            id="camp-ai"
            name="aiContext"
            maxLength={2000}
            rows={4}
            defaultValue={campaign.aiContext ?? ""}
            className={`${fieldClass} min-h-[6rem] resize-y`}
          />
        </FieldGroup>
        <FieldGroup
          label="Mensaje final del funnel (opcional)"
          htmlFor="camp-closing"
          hint="Se muestra al ciudadano después de la conclusión IA (enlaces, web, más información)."
        >
          <textarea
            id="camp-closing"
            name="closingCtaText"
            maxLength={8000}
            rows={4}
            defaultValue={campaign.closingCtaText ?? ""}
            placeholder="Ej.: Más información: https://..."
            className={`${fieldClass} min-h-[6rem] resize-y`}
          />
        </FieldGroup>

        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/30 p-4">
          <p className="text-sm font-medium text-[var(--foreground)]">Imagen y banner (opcional)</p>
          <p className="text-xs text-[var(--muted)]">Recomendado: banner 1600×600 (8:3) y foto 512×512 (cuadrada).</p>
          <CampaignMediaUploader
            campaignId={campaign.id}
            kind="banner"
            label="Banner"
            hint="Imagen horizontal para el encabezado del funnel."
            currentUrl={campaign.bannerUrl}
            fieldName="bannerUrl"
          />
          <CampaignMediaUploader
            campaignId={campaign.id}
            kind="photo"
            label="Fotografía"
            hint="Imagen principal (avatar) de la campaña."
            currentUrl={campaign.photoUrl}
            fieldName="photoUrl"
          />
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-8">
        <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Cupos por campaña</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <FieldGroup label="Máximo de líderes" htmlFor="camp-max-leaders">
            <input
              id="camp-max-leaders"
              name="maxLeaders"
              type="number"
              min={1}
              max={5000}
              defaultValue={campaign.maxLeaders}
              className={fieldClass}
            />
          </FieldGroup>
          <FieldGroup
            label="Máximo de ciudadanos (funnel)"
            htmlFor="camp-max-voters"
            hint="Tope en plan gratuito (por defecto 25). Con Premium en la campaña no aplica este límite en el funnel."
          >
            <input
              id="camp-max-voters"
              name="maxVoters"
              type="number"
              min={1}
              max={10000000}
              defaultValue={campaign.maxVoters}
              className={fieldClass}
            />
          </FieldGroup>
        </div>
      </div>

      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-95 disabled:opacity-60"
        >
          {isPending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Colores del embudo ciudadano</h3>
        <p className="text-xs text-[var(--muted)]">
          Solo afecta la URL pública <code className="rounded bg-[var(--border)] px-1">/c/…</code>; este panel conserva
          el tema Afini/Cyelos.
        </p>
        <CampaignFunnelThemeForm campaignId={campaign.id} initialTheme={campaign.funnelTheme} />
      </div>
    </div>
  );
}

export function AssignAdminForm({ campaignId }: { campaignId: string }) {
  const [state, formAction, isPending] = useActionState(
    assignCampaignAdminAction.bind(null, campaignId),
    initialDashboardFormState,
  );

  return (
    <form action={formAction} className="mt-6 flex max-w-3xl flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <FieldGroup label="Correo del administrador" htmlFor="assign-email">
          <input
            id="assign-email"
            name="email"
            type="email"
            required
            placeholder="admin@ejemplo.com"
            className={fieldClass}
          />
        </FieldGroup>
        <FieldGroup
          label="Contraseña (opcional, usuario nuevo)"
          htmlFor="assign-password"
          hint="Si lo dejas vacío, el admin entrará solo con Google usando este correo."
        >
          <input
            id="assign-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Vacío = solo Google"
            className={fieldClass}
          />
        </FieldGroup>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--border)]/40 disabled:opacity-60"
        >
          {isPending ? "Asignando…" : "Asignar administrador"}
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
