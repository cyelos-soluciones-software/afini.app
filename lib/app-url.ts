/**
 * Base URL pública para compartir enlaces (WhatsApp, etc.).
 * @returns `NEXT_PUBLIC_APP_URL`, o `https://` + `VERCEL_URL`, o `http://localhost:3000`.
 */
export function getPublicBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL;
  if (env) {
    if (env.startsWith("http")) return env.replace(/\/$/, "");
    return `https://${env.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}
