import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignHeatmapData, getCampaignHeatmapSentimentData } from "@/app/actions/campaign-manager";
import { HeatmapViewTabs } from "./heatmap-view-tabs";

export default async function CampaignHeatmapPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const [intention, sentiment] = await Promise.all([
    getCampaignHeatmapData(campaignId),
    getCampaignHeatmapSentimentData(campaignId),
  ]);
  if (!intention || !sentiment) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/dashboard/campaign-admin/${campaignId}`} className="text-sm text-[var(--primary)] hover:underline">
          ← {intention.campaignName}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Mapas de calor</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          OpenStreetMap + Leaflet. Elige intención de voto o sentimiento (IA); ambos usan la geolocalización del ciudadano
          cuando aceptó compartir ubicación.
        </p>
      </div>

      <HeatmapViewTabs intention={intention} sentiment={sentiment} />
    </div>
  );
}
