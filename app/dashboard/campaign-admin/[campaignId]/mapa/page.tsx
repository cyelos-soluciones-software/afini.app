import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignHeatmapData } from "@/app/actions/campaign-manager";
import { CampaignHeatMapDynamic } from "@/app/components/campaign-heat-map-dynamic";

export default async function CampaignHeatmapPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const data = await getCampaignHeatmapData(campaignId);
  if (!data) notFound();

  const { campaignName, yes, no, maybe, stats } = data;

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/dashboard/campaign-admin/${campaignId}`} className="text-sm text-[var(--primary)] hover:underline">
          ← {campaignName}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Mapa de calor · intención de voto</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          OpenStreetMap + Leaflet. Cada capa agrupa la densidad aproximada de registros con GPS (o coordenadas de
          prueba) según la intención declarada al cerrar el funnel.
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Con coordenadas: <span className="font-medium text-[var(--foreground)]">{stats.withGeo}</span> · Sin
          coordenadas: <span className="font-medium text-[var(--foreground)]">{stats.withoutGeo}</span> · Puntos en
          mapa: Sí {stats.yes}, No {stats.no}, Tal vez {stats.maybe}
        </p>
      </div>

      <CampaignHeatMapDynamic yes={yes} no={no} maybe={maybe} />

      <p className="text-xs text-[var(--muted)]">
        Los datos de ubicación dependen del permiso del navegador del ciudadano. Las coordenadas son aproximadas; no
        sustituyen censos oficiales.
      </p>
    </div>
  );
}
