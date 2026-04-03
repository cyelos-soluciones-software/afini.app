import Link from "next/link";
import { LogoCyelos } from "@/app/components/brand-logos";

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <LogoCyelos priority className="object-left" />
            <div className="hidden h-10 w-px bg-[var(--border)] sm:block" aria-hidden />
            <div className="hidden flex-col sm:flex">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Eco</span>
              <span className="text-[11px] text-[var(--muted)]">Movilización digital</span>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-92 active:scale-[0.98]"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-4 py-12 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">PWA · Paneles por rol</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
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
