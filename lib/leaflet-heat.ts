/**
 * Wrapper tipado sobre `leaflet.heat` (`L.heatLayer`).
 * Importar solo en componentes cliente.
 * @packageDocumentation
 */
import L from "leaflet";
import "leaflet.heat";

type HeatOpts = {
  minOpacity?: number;
  maxZoom?: number;
  max?: number;
  radius?: number;
  blur?: number;
  gradient?: Record<number, string>;
};

/**
 * Crea una capa de mapa de calor Leaflet.
 * @param latlngs - Puntos `[lat, lng, intensidad]` (intensidad típica 0–1).
 * @param options - `radius`, `blur`, `gradient`, etc. Evitar clave entera `1` en `gradient` (ver `AGENTS.md`).
 * @returns Capa añadible con `addTo(map)`.
 */
export function createHeatLayer(latlngs: [number, number, number][], options?: HeatOpts): L.Layer {
  const Lheat = L as unknown as { heatLayer: (ll: [number, number, number][], o?: HeatOpts) => L.Layer };
  return Lheat.heatLayer(latlngs, options);
}
