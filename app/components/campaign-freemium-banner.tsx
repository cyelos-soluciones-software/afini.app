import { voterWarningThreshold } from "@/lib/plan-limits";

type Props = {
  voterCount: number;
  /** Si algún admin/creador con plan premium cubre la campaña. */
  premiumUnlocked: boolean;
  /** Cupo máximo de ciudadanos (plan gratuito), configurable por súper admin. */
  maxVotersCap: number;
};

/**
 * Barra de progreso freemium y avisos tipo alerta (estilo Shadcn-like con tokens del tema).
 */
export function CampaignFreemiumBanner({ voterCount, premiumUnlocked, maxVotersCap }: Props) {
  if (premiumUnlocked) return null;

  const cap = Math.max(1, maxVotersCap);
  const pct = Math.min(100, Math.round((voterCount / cap) * 100));
  const warnAt = voterWarningThreshold(cap);
  const warn = voterCount >= warnAt && voterCount < cap;
  const full = voterCount >= cap;

  return (
    <div className="space-y-4">
      {warn ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-50"
        >
          <p className="font-medium">¡Tu campaña es un éxito!</p>
          <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
            Estás a punto de alcanzar el límite de {cap} ciudadanos en esta campaña (plan gratuito). El upgrade Premium se
            acuerda por campaña con ventas.
          </p>
        </div>
      ) : null}
      {full ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-950 dark:border-red-400/40 dark:bg-red-400/10 dark:text-red-50"
        >
          <p className="font-medium">Límite de plan gratuito alcanzado</p>
          <p className="mt-1 text-red-900/90 dark:text-red-100/90">
            En esta campaña no se aceptan más ciudadanos hasta ampliar con Premium (contacto por campaña). Quienes ya
            participaron no se pierden.
          </p>
        </div>
      ) : null}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
          <span>Ciudadanos analizados</span>
          <span className="text-[var(--foreground)]">
            {voterCount} / {cap}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className={`h-full rounded-full transition-all ${full ? "bg-red-500" : warn ? "bg-amber-500" : "bg-[var(--primary)]"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
