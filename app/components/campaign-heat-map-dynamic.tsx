/**
 * Carga diferida del mapa con `ssr: false` (Next.js 16 no permite `dynamic`+`ssr:false` en Server Components).
 */
"use client";

import dynamic from "next/dynamic";
import type { HeatMapPoint } from "@/app/components/campaign-heat-map";

const CampaignHeatMap = dynamic(
  () => import("@/app/components/campaign-heat-map").then((m) => m.CampaignHeatMap),
  {
    ssr: false,
    loading: () => (
      <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
        Cargando mapa…
      </p>
    ),
  },
);

export function CampaignHeatMapDynamic(props: {
  yes: HeatMapPoint[];
  no: HeatMapPoint[];
  maybe: HeatMapPoint[];
}) {
  return <CampaignHeatMap {...props} />;
}
