/**
 * Utilidades para la API de geolocalización del navegador (`navigator.geolocation`).
 * Solo ejecutar en el cliente.
 * @packageDocumentation
 */
export type CitizenGeoCoords = {
  latitude: number;
  longitude: number;
};

const DEFAULT_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 0,
};

/**
 * Solicita una posición actual con `getCurrentPosition`.
 * @param options - Opciones del navegador; por defecto alta precisión, sin caché, timeout 15s.
 * @returns Coordenadas WGS84 o `null` si no hay API, denegación, timeout u otro error.
 */
export function requestCitizenGeolocation(
  options: PositionOptions = DEFAULT_OPTIONS,
): Promise<CitizenGeoCoords | null> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => resolve(null),
      { ...DEFAULT_OPTIONS, ...options },
    );
  });
}
