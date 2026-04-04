/**
 * Limitación de peticiones al endpoint del funnel (`/api/funnel/stream`).
 * Usa Upstash Redis si `UPSTASH_REDIS_REST_*` están definidas; si no, contador en memoria por IP (no compartido entre instancias).
 * @packageDocumentation
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Ventana y cupo por IP (aprox.) para el funnel.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 25;
const buckets = new Map<string, { count: number; resetAt: number }>();

let upstashLimiter: Ratelimit | null = null;

/** Construye el limitador Redis una sola vez (lazy). */
function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter) return upstashLimiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const redis = Redis.fromEnv();
  upstashLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "1 m"),
    prefix: "afini:funnel",
  });
  return upstashLimiter;
}

/** Clave de cliente: primera IP de `x-forwarded-for` o `x-real-ip`. */
function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Sliding window en memoria por clave `funnel:<ip>`. */
function memoryCheck(req: Request): { ok: true } | { ok: false; retryAfterSec: number } {
  const key = `funnel:${clientKey(req)}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (b.count >= MAX_REQUESTS) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
  }
  b.count += 1;
  return { ok: true };
}

/**
 * Evalúa si la petición al funnel debe aceptarse.
 * @param req - Request HTTP entrante.
 * @returns `ok: true` si hay cupo; si no, `retryAfterSec` sugerido para cabecera `Retry-After`.
 */
export async function checkFunnelRateLimit(
  req: Request,
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const limiter = getUpstashLimiter();
  if (!limiter) {
    return memoryCheck(req);
  }
  const ip = clientKey(req);
  const { success, reset } = await limiter.limit(ip);
  if (success) {
    return { ok: true };
  }
  const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return { ok: false, retryAfterSec };
}
