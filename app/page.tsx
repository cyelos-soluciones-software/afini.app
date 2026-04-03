import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <span className="text-lg font-semibold tracking-tight">Eco · Cyelos</span>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 font-medium text-[var(--primary)] hover:bg-[var(--border)]/60"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-4 py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--primary)]">
          MVP · Paneles y PWA
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Campañas electorales con enlaces virales y analítica
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
          Funnel con Gemini (streaming), paneles por rol (super admin, admin de campaña, líder), métricas con
          gráficas, misiones con WhatsApp, PWA e indicador para instalar en iPhone. Clave Gemini en{" "}
          <code className="rounded bg-[var(--border)] px-1 py-0.5 text-xs">.env</code>.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/c/demo/demo-token-1"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-90"
          >
            Probar funnel demo
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]/40"
          >
            Ir al panel
          </Link>
          <a
            href="https://cyelos.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]/40"
          >
            Cyelos.com
          </a>
        </div>
      </main>
    </div>
  );
}
