/**
 * Verificación del token de Cloudflare Turnstile (servidor).
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

export type TurnstileVerifyResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Valida `token` contra la API de Cloudflare usando `TURNSTILE_SECRET_KEY`.
 */
export async function verifyTurnstileToken(
  token: string,
  remoteip?: string,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { success: false, error: "missing_secret" };
  }

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token.trim());
  if (remoteip) form.set("remoteip", remoteip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });

  const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };

  if (data.success === true) {
    return { success: true };
  }

  const codes = data["error-codes"]?.join(", ") ?? "unknown";
  return { success: false, error: codes };
}
