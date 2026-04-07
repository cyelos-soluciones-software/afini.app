"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loginErrors: Record<string, string> = {
  GoogleSoloAdministradores:
    "Inicia sesión con correo y contraseña si eres líder digital. Google está reservado para administradores de campaña.",
  GoogleSinCorreo: "Google no devolvió un correo válido. Prueba otra cuenta o contacta soporte.",
  OAuthAccountNotLinked: "No pudimos vincular tu cuenta. Usa el método de acceso que te asignaron.",
};

export function LoginForm({
  callbackUrl,
  googleEnabled,
  errorCode,
}: {
  callbackUrl?: string;
  googleEnabled: boolean;
  errorCode?: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

  const oauthMessage = errorCode ? loginErrors[errorCode] ?? "No se pudo completar el inicio de sesión." : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const emailTrim = email.trim().toLowerCase();
    const passwordTrim = password.trim();
    const res = await signIn("credentials", {
      email: emailTrim,
      password: passwordTrim,
      redirect: false,
      callbackUrl: safeCallback,
    });
    setPending(false);
    if (!res?.ok) {
      setError(
        "Correo o contraseña incorrectos, o este acceso no aplica a tu rol. Si es la primera vez, ejecuta en la raíz del proyecto: npm run db:seed. Usa siempre la misma URL (p. ej. solo http://localhost:3000 o solo http://127.0.0.1:3000).",
      );
      return;
    }
    router.push(res.url ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {googleEnabled ? (
        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_32px_var(--brand-glow)]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Administrador de campaña</h2>
          <p className="text-xs text-[var(--muted)]">Entra con Google (cuenta autorizada como administrador).</p>
          {oauthMessage ? (
            <p className="text-sm text-amber-700 dark:text-amber-300" role="alert">
              {oauthMessage}
            </p>
          ) : null}
          <button
            type="button"
            disabled={googlePending}
            onClick={() => {
              setGooglePending(true);
              void signIn("google", { callbackUrl: safeCallback });
            }}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--border)]/40 disabled:opacity-60"
          >
            {googlePending ? "Redirigiendo…" : "Continuar con Google"}
          </button>
        </div>
      ) : null}

      <form
        noValidate
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_8px_32px_var(--brand-glow)]"
      >
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Líder de campaña</h2>
        <p className="text-xs text-[var(--muted)]">
          Correo y contraseña.
        </p>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="text"
            inputMode="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none ring-[var(--primary)] focus:ring-2"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none ring-[var(--primary)] focus:ring-2"
          />
        </div>
        {error ? (
          <p className="text-sm font-medium text-[var(--destructive)]" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="min-h-[48px] w-full rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
        >
          {pending ? "Entrando…" : "Entrar con correo y contraseña"}
        </button>
        <p className="text-[11px] text-[var(--muted)]">
          En producción, los administradores de campaña deben usar Google; súper admin y líderes usan este formulario.
        </p>
      </form>
    </div>
  );
}
