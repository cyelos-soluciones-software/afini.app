"use client";

import dynamic from "next/dynamic";
import type { HeatMapPoint } from "@/app/components/campaign-heat-map";

const CampaignSentimentHeatMap = dynamic(
  () => import("@/app/components/campaign-sentiment-heat-map").then((m) => m.CampaignSentimentHeatMap),
  {
    ssr: false,
    loading: () => (
      <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
        Cargando mapa…
      </p>
    ),
  },
);

export function CampaignSentimentHeatMapDynamic(props: {
  positive: HeatMapPoint[];
  neutral: HeatMapPoint[];
  negative: HeatMapPoint[];
}) {
  return <CampaignSentimentHeatMap {...props} />;
}
