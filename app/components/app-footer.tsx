import Link from "next/link";
import { LogoCodeImagen } from "@/app/components/brand-logos";

/**
 * Pie global: legal, Cyelos, logo secundario e indicaciones PWA (Android / escritorio / iOS vía banner en app).
 */
export function AppFooter() {
  return (
    <footer
      className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2 text-center sm:text-left">
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)]">afini.app</span> es propiedad de{" "}
            <Link
              href="https://www.cyelos.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--primary)] underline-offset-2 hover:underline"
            >
              Cyelos
            </Link>
            . NIT <span className="whitespace-nowrap font-medium text-[var(--foreground)]">901.619.792-1</span>.
          </p>
          <p className="text-[11px] text-[var(--muted)]">
            <Link href="/privacidad" className="font-medium text-[var(--primary)] underline-offset-2 hover:underline">
              Política de privacidad
            </Link>
          </p>
          <p className="text-[11px] leading-snug text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)]">Instalar como app (PWA):</span> en Chrome o Edge, menú
            ⋮ → <em>Instalar aplicación</em> o <em>Instalar Afini</em>. En Safari (iPhone), usa{" "}
            <em>Compartir → Añadir a inicio</em>.
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-center gap-3 sm:justify-end">
          <span className="hidden text-[10px] uppercase tracking-wider text-[var(--muted)] sm:inline">Cyelos</span>
          <LogoCodeImagen />
        </div>
      </div>
    </footer>
  );
}
