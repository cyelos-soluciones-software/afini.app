"use client";

import { useState } from "react";
import { CampaignHeatMapDynamic } from "@/app/components/campaign-heat-map-dynamic";
import { CampaignSentimentHeatMapDynamic } from "@/app/components/campaign-sentiment-heat-map-dynamic";
import type { HeatmapGeoPoint } from "@/app/actions/campaign-manager";

type IntentionPayload = {
  yes: HeatmapGeoPoint[];
  no: HeatmapGeoPoint[];
  maybe: HeatmapGeoPoint[];
  stats: {
    yes: number;
    no: number;
    maybe: number;
    withGeo: number;
    withoutGeo: number;
  };
};

type SentimentPayload = {
  positive: HeatmapGeoPoint[];
  neutral: HeatmapGeoPoint[];
  negative: HeatmapGeoPoint[];
  stats: {
    positive: number;
    neutral: number;
    negative: number;
    withGeo: number;
    withoutGeo: number;
    withGeoNoSentiment: number;
  };
};

type Props = {
  intention: IntentionPayload;
  sentiment: SentimentPayload;
};

export function HeatmapViewTabs({ intention, sentiment }: Props) {
  const [mode, setMode] = useState<"intention" | "sentiment">("intention");

  const tabBase =
    "rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30";
  const tabActive = "bg-[var(--primary)]/15 text-[var(--primary)] ring-1 ring-[var(--primary)]/25";
  const tabIdle = "text-[var(--muted)] hover:bg-[var(--border)]/60 hover:text-[var(--foreground)]";

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5"
        role="tablist"
        aria-label="Tipo de mapa"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "intention"}
          className={`${tabBase} ${mode === "intention" ? tabActive : tabIdle}`}
          onClick={() => setMode("intention")}
        >
          Intención de voto
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sentiment"}
          className={`${tabBase} ${mode === "sentiment" ? tabActive : tabIdle}`}
          onClick={() => setMode("sentiment")}
        >
          Sentimiento (IA)
        </button>
      </div>

      {mode === "intention" ? (
        <div className="space-y-4" role="tabpanel">
          <p className="text-sm text-[var(--muted)]">
            Cada capa agrupa la densidad aproximada de registros con GPS según la{" "}
            <strong className="text-[var(--foreground)]">intención de voto</strong> declarada al cerrar el funnel.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Con coordenadas: <span className="font-medium text-[var(--foreground)]">{intention.stats.withGeo}</span> ·
            Sin coordenadas:{" "}
            <span className="font-medium text-[var(--foreground)]">{intention.stats.withoutGeo}</span> · Puntos: Sí{" "}
            {intention.stats.yes}, No {intention.stats.no}, Tal vez {intention.stats.maybe}
          </p>
          <CampaignHeatMapDynamic yes={intention.yes} no={intention.no} maybe={intention.maybe} />
        </div>
      ) : (
        <div className="space-y-4" role="tabpanel">
          <p className="text-sm text-[var(--muted)]">
            Capas según la clasificación de <strong className="text-[var(--foreground)]">sentimiento (IA)</strong> de la
            última interacción del funnel con dato guardado (positivo / neutral / negativo) y coordenadas del ciudadano.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Con coordenadas: <span className="font-medium text-[var(--foreground)]">{sentiment.stats.withGeo}</span> · Sin
            coordenadas: <span className="font-medium text-[var(--foreground)]">{sentiment.stats.withoutGeo}</span> · Con
            GPS pero sin sentimiento IA:{" "}
            <span className="font-medium text-[var(--foreground)]">{sentiment.stats.withGeoNoSentiment}</span> · Puntos
            en mapa: Positivo {sentiment.stats.positive}, Neutral {sentiment.stats.neutral}, Negativo{" "}
            {sentiment.stats.negative}
          </p>
          <CampaignSentimentHeatMapDynamic
            positive={sentiment.positive}
            neutral={sentiment.neutral}
            negative={sentiment.negative}
          />
        </div>
      )}

      <p className="text-xs text-[var(--muted)]">
        Los datos de ubicación dependen del permiso del navegador del ciudadano. Las coordenadas son aproximadas; no
        sustituyen censos oficiales.
      </p>
    </div>
  );
}
