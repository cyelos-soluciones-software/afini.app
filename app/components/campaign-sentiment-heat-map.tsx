/**
 * Mapa Leaflet + capas de calor por sentimiento IA (positivo / neutral / negativo).
 */
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createHeatLayer } from "@/lib/leaflet-heat";
import type { HeatMapPoint } from "@/app/components/campaign-heat-map";

function toTriples(points: HeatMapPoint[], intensity: number): [number, number, number][] {
  return points.map((p) => [p.lat, p.lng, intensity]);
}

const GRAD_POSITIVE: Record<number, string> = {
  0.35: "rgb(167,243,208)",
  0.65: "rgb(52,211,153)",
  0.99: "rgb(5,150,105)",
};
const GRAD_NEUTRAL: Record<number, string> = {
  0.35: "rgb(203,213,225)",
  0.65: "rgb(148,163,184)",
  0.99: "rgb(100,116,139)",
};
const GRAD_NEGATIVE: Record<number, string> = {
  0.35: "rgb(254,202,202)",
  0.65: "rgb(248,113,113)",
  0.99: "rgb(220,38,38)",
};

function SentimentHeatmapLayers({
  positive,
  neutral,
  negative,
  showPositive,
  showNeutral,
  showNegative,
}: {
  positive: HeatMapPoint[];
  neutral: HeatMapPoint[];
  negative: HeatMapPoint[];
  showPositive: boolean;
  showNeutral: boolean;
  showNegative: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const layers: L.Layer[] = [];
    let cancelled = false;
    const opts = { radius: 28, blur: 20, maxZoom: 18, minOpacity: 0.35 };

    function mapHasSize(): boolean {
      const { x, y } = map.getSize();
      return x >= 4 && y >= 4;
    }

    function addHeatLayers() {
      if (cancelled || !mapHasSize()) return;
      if (showPositive && positive.length > 0) {
        layers.push(createHeatLayer(toTriples(positive, 0.72), { ...opts, gradient: GRAD_POSITIVE }).addTo(map));
      }
      if (showNeutral && neutral.length > 0) {
        layers.push(createHeatLayer(toTriples(neutral, 0.72), { ...opts, gradient: GRAD_NEUTRAL }).addTo(map));
      }
      if (showNegative && negative.length > 0) {
        layers.push(createHeatLayer(toTriples(negative, 0.72), { ...opts, gradient: GRAD_NEGATIVE }).addTo(map));
      }
    }

    function tryMount(attemptsLeft: number) {
      if (cancelled) return;
      map.invalidateSize();
      if (mapHasSize()) {
        addHeatLayers();
        return;
      }
      if (attemptsLeft <= 0) return;
      requestAnimationFrame(() => tryMount(attemptsLeft - 1));
    }

    map.whenReady(() => tryMount(24));

    return () => {
      cancelled = true;
      layers.forEach((layer) => {
        map.removeLayer(layer);
      });
    };
  }, [map, positive, neutral, negative, showPositive, showNeutral, showNegative]);

  useEffect(() => {
    const visible: HeatMapPoint[] = [
      ...(showPositive ? positive : []),
      ...(showNeutral ? neutral : []),
      ...(showNegative ? negative : []),
    ];
    if (visible.length === 0) return;
    const b = L.latLngBounds(visible.map((p) => [p.lat, p.lng] as [number, number]));
    if (!b.isValid()) return;
    map.fitBounds(b, { padding: [52, 52], maxZoom: 12, animate: false });
  }, [map, positive, neutral, negative, showPositive, showNeutral, showNegative]);

  return null;
}

export function CampaignSentimentHeatMap({
  positive,
  neutral,
  negative,
}: {
  positive: HeatMapPoint[];
  neutral: HeatMapPoint[];
  negative: HeatMapPoint[];
}) {
  const [showPositive, setShowPositive] = useState(true);
  const [showNeutral, setShowNeutral] = useState(true);
  const [showNegative, setShowNegative] = useState(true);

  const hasAny = positive.length + neutral.length + negative.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--foreground)]">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Capas (IA)</span>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showPositive}
            onChange={(e) => setShowPositive(e.target.checked)}
            className="rounded"
          />
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            Positivo
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={showNeutral} onChange={(e) => setShowNeutral(e.target.checked)} className="rounded" />
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden />
            Neutral
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showNegative}
            onChange={(e) => setShowNegative(e.target.checked)}
            className="rounded"
          />
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
            Negativo
          </span>
        </label>
      </div>

      {!hasAny ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
          No hay puntos con geolocalización y sentimiento IA clasificado. El sentimiento se guarda al cerrar el funnel
          cuando la IA devuelve positivo / neutral / negativo; los ciudadanos deben haber aceptado ubicación.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <MapContainer
            center={[4.57, -74.3]}
            zoom={6}
            className="w-full [&_.leaflet-tile-pane]:opacity-100"
            style={{ height: "min(70vh, 520px)", minHeight: 280, width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <SentimentHeatmapLayers
              positive={positive}
              neutral={neutral}
              negative={negative}
              showPositive={showPositive}
              showNeutral={showNeutral}
              showNegative={showNegative}
            />
          </MapContainer>
        </div>
      )}
    </div>
  );
}
