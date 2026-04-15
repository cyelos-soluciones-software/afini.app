"use client";

import { useActionState, useState } from "react";
import { updateCampaignFunnelThemeAction } from "@/app/actions/campaign-manager";
import type { FunnelThemeStored } from "@/lib/funnel-theme";
import { FUNNEL_THEME_FORM_FIELDS, hexForColorInput } from "@/lib/funnel-theme";
import { initialDashboardFormState } from "@/lib/dashboard-form-state";

const fieldClass =
  "min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25";

const labels: Record<keyof FunnelThemeStored, { label: string; hint: string }> = {
  background: { label: "Fondo de página", hint: "Área principal detrás del formulario." },
  foreground: { label: "Texto principal", hint: "Títulos y contenido destacado." },
  muted: { label: "Texto secundario", hint: "Párrafos, etiquetas y ayudas." },
  border: { label: "Bordes", hint: "Contornos de campos y tarjetas." },
  surface: { label: "Superficie (tarjetas)", hint: "Fondos de bloques y burbujas." },
  primary: { label: "Color de acento", hint: "Barra de progreso y botones principales." },
  primaryForeground: { label: "Texto sobre acento", hint: "Letra dentro del botón principal y chips activos." },
};

/** Valor visual del picker cuando el hex está vacío (heredar del sitio); no se envía hasta elegir un color. */
const PICKER_PLACEHOLDER = "#888888";

type Props = {
  campaignId: string;
  /** Tema guardado o null. */
  initialTheme: unknown;
};

function initialHex(theme: unknown, key: keyof FunnelThemeStored): string {
  if (theme == null || typeof theme !== "object" || Array.isArray(theme)) return "";
  const v = (theme as Record<string, unknown>)[key];
  return typeof v === "string" ? v : "";
}

type ThemeColorRowProps = {
  formName: string;
  themeKey: keyof FunnelThemeStored;
  initial: string;
};

/**
 * Campo hex con paleta nativa (`type="color"`) sincronizada en la misma página.
 */
function ThemeColorRow({ formName, themeKey, initial }: ThemeColorRowProps) {
  const [hex, setHex] = useState(initial);
  const { label, hint } = labels[themeKey];
  const pickerValue = hex.trim() ? hexForColorInput(hex) : PICKER_PLACEHOLDER;
  const pickerId = `${formName}-picker`;
  const textId = formName;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textId} className="text-xs font-medium text-[var(--foreground)]">
        {label}
      </label>
      <p className="text-[11px] text-[var(--muted)]">{hint}</p>
      <div className="flex flex-wrap items-stretch gap-2">
        <input
          id={pickerId}
          type="color"
          aria-label={`Paleta de color: ${label}`}
          title="Abrir paleta de colores"
          className="h-10 w-[3.25rem] shrink-0 cursor-pointer overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] p-1 shadow-sm"
          value={pickerValue}
          onChange={(e) => setHex(e.target.value.toLowerCase())}
        />
        <input
          id={textId}
          name={formName}
          type="text"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          placeholder="#1a1a1a"
          pattern="^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$"
          title="Hex: #RGB, #RRGGBB o #RRGGBBAA"
          className={fieldClass}
        />
      </div>
    </div>
  );
}

/**
 * Formulario para personalizar colores del embudo ciudadano (solo rutas `/c/...`).
 */
export function CampaignFunnelThemeForm({ campaignId, initialTheme }: Props) {
  const [state, formAction, isPending] = useActionState(
    updateCampaignFunnelThemeAction.bind(null, campaignId),
    initialDashboardFormState,
  );

  return (
    <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div>
        <h3 className="text-sm font-medium text-[var(--foreground)]">Apariencia del embudo público</h3>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
          Colores solo para la URL del ciudadano (<code className="rounded bg-[var(--border)] px-1">/c/slug/token</code>
          ). El panel de administración conserva el tema Afini/Cyelos. Puedes elegir tonos con la{" "}
          <strong className="font-medium text-[var(--foreground)]">paleta</strong> o escribir hex (#RGB, #RRGGBB o
          #RRGGBBAA). Deja el campo de texto vacío para heredar el valor por defecto del sitio en ese aspecto.
        </p>
      </div>
      <form action={formAction} className="grid gap-4 sm:grid-cols-2">
        {FUNNEL_THEME_FORM_FIELDS.map(({ formName, key }) => {
          const initial = initialHex(initialTheme, key);
          return (
            <ThemeColorRow
              key={`${formName}-${initial}`}
              formName={formName}
              themeKey={key}
              initial={initial}
            />
          );
        })}
        {state.error ? (
          <p className="sm:col-span-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {state.error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-60"
          >
            {isPending ? "Guardando…" : "Guardar colores del embudo"}
          </button>
          <button
            type="submit"
            name="resetTheme"
            value="1"
            disabled={isPending}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]/40 disabled:opacity-60"
          >
            Quitar personalización (tema del sitio)
          </button>
        </div>
      </form>
    </div>
  );
}
