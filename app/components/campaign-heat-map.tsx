/**
 * Mapa Leaflet + OSM con tres capas de calor por intención de voto (cliente únicamente).
 * Ver {@link https://github.com/Leaflet/Leaflet.heat} y notas en AGENTS.md sobre gradientes.
 */
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createHeatLayer } from "@/lib/leaflet-heat";

export type HeatMapPoint = { lat: number; lng: number };

function toTriples(points: HeatMapPoint[], intensity: number): [number, number, number][] {
  return points.map((p) => [p.lat, p.lng, intensity]);
}

/** Claves solo decimales: la clave entera `1` rompe simpleheat/Canvas (orden en for…in → IndexSizeError). */
const GRAD_YES: Record<number, string> = {
  0.35: "rgb(134,239,172)",
  0.65: "rgb(34,197,94)",
  0.99: "rgb(21,128,61)",
};
const GRAD_NO: Record<number, string> = {
  0.35: "rgb(252,165,165)",
  0.65: "rgb(239,68,68)",
  0.99: "rgb(185,28,28)",
};
const GRAD_MAYBE: Record<number, string> = {
  0.35: "rgb(253,230,138)",
  0.65: "rgb(234,179,8)",
  0.99: "rgb(180,83,9)",
};

function HeatmapLayers({
  yes,
  no,
  maybe,
  showYes,
  showNo,
  showMaybe,
}: {
  yes: HeatMapPoint[];
  no: HeatMapPoint[];
  maybe: HeatMapPoint[];
  showYes: boolean;
  showNo: boolean;
  showMaybe: boolean;
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
      if (showYes && yes.length > 0) {
        layers.push(createHeatLayer(toTriples(yes, 0.72), { ...opts, gradient: GRAD_YES }).addTo(map));
      }
      if (showNo && no.length > 0) {
        layers.push(createHeatLayer(toTriples(no, 0.72), { ...opts, gradient: GRAD_NO }).addTo(map));
      }
      if (showMaybe && maybe.length > 0) {
        layers.push(createHeatLayer(toTriples(maybe, 0.72), { ...opts, gradient: GRAD_MAYBE }).addTo(map));
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
  }, [map, yes, no, maybe, showYes, showNo, showMaybe]);

  useEffect(() => {
    const visible: HeatMapPoint[] = [
      ...(showYes ? yes : []),
      ...(showNo ? no : []),
      ...(showMaybe ? maybe : []),
    ];
    if (visible.length === 0) return;
    const b = L.latLngBounds(visible.map((p) => [p.lat, p.lng] as [number, number]));
    if (!b.isValid()) return;
    map.fitBounds(b, { padding: [52, 52], maxZoom: 12, animate: false });
  }, [map, yes, no, maybe, showYes, showNo, showMaybe]);

  return null;
}

export function CampaignHeatMap({
  yes,
  no,
  maybe,
}: {
  yes: HeatMapPoint[];
  no: HeatMapPoint[];
  maybe: HeatMapPoint[];
}) {
  const [showYes, setShowYes] = useState(true);
  const [showNo, setShowNo] = useState(true);
  const [showMaybe, setShowMaybe] = useState(true);

  const hasAny = yes.length + no.length + maybe.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--foreground)]">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Capas</span>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={showYes} onChange={(e) => setShowYes(e.target.checked)} className="rounded" />
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            Sí
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={showNo} onChange={(e) => setShowNo(e.target.checked)} className="rounded" />
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
            No
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showMaybe}
            onChange={(e) => setShowMaybe(e.target.checked)}
            className="rounded"
          />
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
            Tal vez
          </span>
        </label>
      </div>

      {!hasAny ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
          No hay puntos con coordenadas para esta campaña. Los nuevos registros pueden incluir ubicación si el
          ciudadano acepta el permiso del navegador; en entornos de prueba, vuelve a ejecutar{" "}
          <code className="rounded bg-[var(--border)] px-1">npm run db:seed</code> para rellenar coordenadas de
          ejemplo en Colombia.
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
            <HeatmapLayers
              yes={yes}
              no={no}
              maybe={maybe}
              showYes={showYes}
              showNo={showNo}
              showMaybe={showMaybe}
            />
          </MapContainer>
        </div>
      )}
    </div>
  );
}
