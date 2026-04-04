import Link from "next/link";
import { LogoCyelos } from "@/app/components/brand-logos";

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <LogoCyelos priority className="object-left" />
            <span className="hidden h-10 w-px bg-[var(--border)] sm:block" aria-hidden />
            <div className="hidden min-w-0 flex-col sm:flex">
              <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                Afini
              </span>
              <span className="text-[11px] text-[var(--muted)]">afini.app</span>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-105 active:scale-[0.98]"
            >
              Entrar al panel
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-4 py-10 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">afini.app · PWA</p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Crea y evalúa redes de afinidad con funnel con IA y paneles por rol
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
          Afini conecta la movilización digital con señales de afinidad: mismas herramientas en navegador o como app
          instalada. Súper administrador, administrador de campaña y líder entran con su cuenta. Instala desde el menú
          del navegador o sigue la sugerencia en iPhone.
        </p>
        <ul className="mt-6 max-w-2xl list-inside list-disc space-y-1.5 text-sm text-[var(--muted)]">
          <li>Interfaz pensada para móvil, táctil y zona segura (notch).</li>
          <li>Sin tienda de apps; las actualizaciones llegan al volver a entrar.</li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/c/demo/demo-token-1"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--border)]/50 active:scale-[0.98]"
          >
            Probar funnel demo
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-105 active:scale-[0.98]"
          >
            Ir al panel
          </Link>
          <a
            href="https://www.cyelos.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--border)]/50 active:scale-[0.98]"
          >
            Cyelos
          </a>
        </div>
      </main>
    </div>
  );
}
