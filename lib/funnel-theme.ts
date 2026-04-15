/**
 * Tema visual opcional del embudo `/c/[slug]/[token]`: validación y variables CSS.
 * @packageDocumentation
 */
import type { CSSProperties } from "react";

/** Claves persistidas en `Campaign.funnelTheme` (JSON). */
export type FunnelThemeStored = {
  background?: string;
  foreground?: string;
  muted?: string;
  border?: string;
  surface?: string;
  primary?: string;
  primaryForeground?: string;
};

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/**
 * @param input - Valor hex (#rgb, #rrggbb o #rrggbbaa).
 * @returns Hex normalizado o null si vacío o inválido.
 */
export function parseThemeColor(input: string): string | null {
  const t = input.trim();
  if (!t) return null;
  return HEX_COLOR.test(t) ? t : null;
}

/**
 * Convierte un hex válido al formato que acepta `input[type="color"]` (#rrggbb en minúsculas).
 * @remarks `#rgb` se expande; `#rrggbbaa` pierde el canal alpha en el picker (el texto puede conservarlo).
 */
export function hexForColorInput(raw: string): string {
  const t = parseThemeColor(raw);
  if (!t) return "#000000";
  if (t.length === 4) {
    const r = t[1]!;
    const g = t[2]!;
    const b = t[3]!;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (t.length === 9) {
    return `#${t.slice(1, 7).toLowerCase()}`;
  }
  return t.toLowerCase();
}

const THEME_KEYS = [
  "background",
  "foreground",
  "muted",
  "border",
  "surface",
  "primary",
  "primaryForeground",
] as const satisfies readonly (keyof FunnelThemeStored)[];

/**
 * Interpreta JSON almacenado en campaña y descarta claves o valores inválidos.
 */
export function parseFunnelThemeJson(raw: unknown): FunnelThemeStored | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const out: FunnelThemeStored = {};
  for (const key of THEME_KEYS) {
    const v = o[key];
    if (typeof v !== "string") continue;
    const c = parseThemeColor(v);
    if (c) out[key] = c;
  }
  return Object.keys(out).length > 0 ? out : null;
}

/** Prefijos de campos en `FormData` del panel de campaña. */
export const FUNNEL_THEME_FORM_FIELDS: { formName: string; key: keyof FunnelThemeStored }[] = [
  { formName: "themeBackground", key: "background" },
  { formName: "themeForeground", key: "foreground" },
  { formName: "themeMuted", key: "muted" },
  { formName: "themeBorder", key: "border" },
  { formName: "themeSurface", key: "surface" },
  { formName: "themePrimary", key: "primary" },
  { formName: "themePrimaryForeground", key: "primaryForeground" },
];

/**
 * Construye objeto de tema desde el formulario de administración.
 * @returns `null` si no hay ningún color válido (se guardará tema por defecto = limpiar JSON).
 */
export function parseFunnelThemeFromForm(formData: FormData): FunnelThemeStored | null {
  const out: FunnelThemeStored = {};
  for (const { formName, key } of FUNNEL_THEME_FORM_FIELDS) {
    const c = parseThemeColor(String(formData.get(formName) ?? ""));
    if (c) out[key] = c;
  }
  return Object.keys(out).length > 0 ? out : null;
}

/**
 * Estilo inline con variables CSS para el contenedor del embudo.
 */
export function funnelThemeToCssVars(theme: unknown): CSSProperties {
  const t = parseFunnelThemeJson(theme);
  if (!t) return {};
  const style: Record<string, string> = {};
  if (t.background) style["--background"] = t.background;
  if (t.foreground) style["--foreground"] = t.foreground;
  if (t.muted) style["--muted"] = t.muted;
  if (t.border) style["--border"] = t.border;
  if (t.surface) style["--surface"] = t.surface;
  if (t.primary) style["--primary"] = t.primary;
  if (t.primaryForeground) style["--primary-foreground"] = t.primaryForeground;
  return style as CSSProperties;
}
