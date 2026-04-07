import { MetricsHomeShell } from "@/app/components/metrics-home-shell";
import { fetchCampaignAdminMetrics, parseSuperAdminMetricsRange } from "@/lib/super-admin-metrics";

type Props = {
  userId: string;
  searchParams: Record<string, string | string[] | undefined>;
};

export async function CampaignAdminHomeDashboard({ userId, searchParams }: Props) {
  const range = parseSuperAdminMetricsRange(searchParams);
  const metrics = await fetchCampaignAdminMetrics(userId, range);

  return (
    <MetricsHomeShell
      metrics={metrics}
      intro={
        <p className="text-sm text-[var(--muted)]">
          Métricas de <strong className="text-[var(--foreground)]">tus campañas</strong> (como creador o administrador
          asignado). Los totales son{" "}
          <strong className="text-[var(--foreground)]">registros nuevos en el período</strong> seleccionado: campañas
          creadas en ese rango, ciudadanos y líderes nuevos en esas campañas, y altas de administradores vinculadas a
          ellas.
        </p>
      }
    />
  );
}
