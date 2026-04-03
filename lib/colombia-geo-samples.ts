/**
 * Coordenadas aproximadas de ciudades colombianas para semillas y pruebas sin GPS real.
 * @packageDocumentation
 */
export const COLOMBIA_CITY_SAMPLES = [
  { lat: 4.711, lng: -74.0721 },
  { lat: 6.2476, lng: -75.5658 },
  { lat: 3.4516, lng: -76.532 },
  { lat: 10.9685, lng: -74.7813 },
  { lat: 10.391, lng: -75.4794 },
  { lat: 7.1193, lng: -73.1227 },
  { lat: 4.8133, lng: -75.6961 },
  { lat: 5.07, lng: -75.5138 },
  { lat: 4.4389, lng: -75.2322 },
  { lat: 1.2136, lng: -77.2811 },
] as const;

/**
 * Aplica ruido uniforme alrededor de un punto (grados decimales).
 * @param lat - Latitud base.
 * @param lng - Longitud base.
 * @param spread - Radio máximo de desplazamiento por eje (~±spread).
 */
export function jitterCoord(lat: number, lng: number, spread = 0.07): { lat: number; lng: number } {
  const r = () => (Math.random() - 0.5) * 2 * spread;
  return { lat: lat + r(), lng: lng + r() };
}
