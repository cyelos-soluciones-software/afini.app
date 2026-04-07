import type { ReactNode } from "react";
import { SuperAdminMetricsFilters } from "@/app/components/super-admin-metrics-filters";
import { SuperAdminVotersDailyChart } from "@/app/components/super-admin-voters-daily-chart";
import type { SuperAdminMetrics } from "@/lib/super-admin-metrics";

type Props = {
  metrics: SuperAdminMetrics;
  /** Párrafo(s) bajo el título (contexto global vs. solo mis campañas). */
  intro: ReactNode;
};

/**
 * Layout compartido del inicio con KPIs, filtros de período y gráfico diario de ciudadanos.
 */
export function MetricsHomeShell({ metrics, intro }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">Inicio</h1>
        <div className="mt-1 space-y-1">{intro}</div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Período actual: <span className="font-medium text-[var(--foreground)]">{metrics.range.label}</span>
        </p>
      </div>

      <SuperAdminMetricsFilters
        currentKey={metrics.range.key}
        fromStr={metrics.range.fromStr}
        toStr={metrics.range.toStr}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Campañas nuevas" value={metrics.campaignsNew} hint="Alta en el período" />
        <KpiCard title="Ciudadanos nuevos" value={metrics.votersNew} hint="Registros en el funnel" />
        <KpiCard title="Líderes nuevos" value={metrics.leadersNew} hint="Perfiles de líder creados" />
        <KpiCard
          title="Admins de campaña (altas)"
          value={metrics.campaignAdminsNew}
          hint="Vínculos nuevos admin–campaña"
        />
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Ciudadanos nuevos por día</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Conteo diario de ciudadanos registrados (zona horaria UTC en agrupación).
        </p>
        <div className="mt-4">
          <SuperAdminVotersDailyChart data={metrics.votersByDay} />
        </div>
      </section>
    </div>
  );
}

function KpiCard({ title, value, hint }: { title: string; value: number; hint: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{title}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-[var(--foreground)]">
        {value.toLocaleString("es-CO")}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-[var(--muted)]">{hint}</p>
    </div>
  );
}
