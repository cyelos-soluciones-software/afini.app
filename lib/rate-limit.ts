import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limit del funnel: en memoria (MVP) o Upstash Redis si hay variables de entorno.
 * En varias instancias sin Redis, cada nodo tiene su propio contador.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 25;
const buckets = new Map<string, { count: number; resetAt: number }>();

let upstashLimiter: Ratelimit | null = null;

function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter) return upstashLimiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const redis = Redis.fromEnv();
  upstashLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "1 m"),
    prefix: "eco:funnel",
  });
  return upstashLimiter;
}

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

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
