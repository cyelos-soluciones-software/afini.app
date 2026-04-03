/**
 * URL pública de la app (para wa.me y enlaces). En local: http://localhost:3000
 */
export function getPublicBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL;
  if (env) {
    if (env.startsWith("http")) return env.replace(/\/$/, "");
    return `https://${env.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}
