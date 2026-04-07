import { MetricsHomeShell } from "@/app/components/metrics-home-shell";
import { fetchSuperAdminMetrics, parseSuperAdminMetricsRange } from "@/lib/super-admin-metrics";

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export async function SuperAdminHomeDashboard({ searchParams }: Props) {
  const range = parseSuperAdminMetricsRange(searchParams);
  const metrics = await fetchSuperAdminMetrics(range);

  return (
    <MetricsHomeShell
      metrics={metrics}
      intro={
        <p className="text-sm text-[var(--muted)]">
          Vista global de la plataforma. Los totales corresponden a{" "}
          <strong className="text-[var(--foreground)]">registros nuevos en el período</strong> seleccionado (campañas,
          ciudadanos, líderes y altas de administradores de campaña).
        </p>
      }
    />
  );
}
