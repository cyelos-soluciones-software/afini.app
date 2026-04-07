import Link from "next/link";
import { LogoCyelos } from "@/app/components/brand-logos";

export const metadata = {
  title: "Motor de afinidad con IA",
  description:
    "Convierte redes sociales en un embudo de afinidad. Mide sentimiento con IA, entiende el territorio y moviliza con privacidad garantizada.",
};

const useCases = [
  {
    icon: "🚀",
    title: "Validación de negocios y startups",
    body: "Mide el product-market fit. Comprueba si tu idea resuelve un problema real antes de invertir fuerte en desarrollo.",
  },
  {
    icon: "🗳️",
    title: "Campañas políticas y sociales",
    body: "Micro-segmentación de respuestas. Identifica quiénes resuenan con tus propuestas y organízalos por territorio o barrio.",
  },
  {
    icon: "👥",
    title: "Recursos humanos y cultura",
    body: "Evalúa afinidad con la cultura de tu empresa antes de la primera entrevista, con conversación guiada por IA.",
  },
  {
    icon: "🤝",
    title: "ONGs y fundaciones",
    body: "Convierte la empatía en acción: localiza voluntarios y donantes más alineados con tu causa.",
  },
  {
    icon: "📢",
    title: "Sindicatos y gremios",
    body: "Mide clima laboral y apoyo real a asambleas o pliegos, con señales claras de compromiso.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <LogoCyelos priority className="shrink-0 object-left" />
            <span className="hidden h-9 w-px bg-[var(--border)] sm:block" aria-hidden />
            <div className="min-w-0">
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)] sm:text-xs">
                Afini
              </p>
              <p className="truncate text-[10px] text-[var(--muted)] sm:text-[11px]">afini.app</p>
            </div>
          </div>
          <nav className="flex flex-shrink-0 items-center gap-2 sm:gap-3" aria-label="Principal">
            <Link
              href="/c/demo/demo-token-1"
              className="hidden min-h-[44px] items-center justify-center rounded-xl px-3 text-sm font-medium text-[var(--primary)] hover:underline sm:inline-flex sm:px-4"
            >
              Ver demo
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-105 active:scale-[0.98] sm:px-5"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* 1. Hero */}
        <section
          className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-14 shadow-[inset_0_1px_0_0_var(--border)] sm:py-20"
          aria-labelledby="hero-heading"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">Motor de afinidad con IA</p>
            <h1
              id="hero-heading"
              className="font-display mt-4 text-[1.65rem] font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl md:text-[2.35rem]"
            >
              Descubre quiénes conectan realmente con tu mensaje y movilízalos.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              Convierte cualquier red social en un embudo de afinidad. Comparte enlaces únicos en WhatsApp, Instagram,
              TikTok o X. Mide el sentimiento de tu audiencia con IA y activa a los más interesados sin exponer datos
              personales entre embajadores.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/login"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-md transition hover:brightness-105 active:scale-[0.99] sm:w-auto"
              >
                Crear mi campaña gratis
              </Link>
              <Link
                href="/c/demo/demo-token-1"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--border)]/40 active:scale-[0.99] sm:w-auto"
              >
                Ver demo
              </Link>
            </div>
            <p className="mt-6 text-xs text-[var(--muted)]">
              Instala Afini como app (PWA) desde el navegador en tu móvil.{" "}
              <a
                href="https://www.cyelos.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--primary)] underline-offset-2 hover:underline"
              >
                Cyelos
              </a>{" "}
              · NIT 901.619.792-1
            </p>
          </div>
        </section>

        {/* 2. Problema vs solución */}
        <section className="px-4 py-14 sm:py-16" aria-labelledby="contraste-heading">
          <div className="mx-auto max-w-5xl">
            <h2 id="contraste-heading" className="sr-only">
              El problema y la solución
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">El problema</p>
                <p className="mt-3 text-base leading-relaxed text-[var(--foreground)]">
                  Las encuestas aburren y los mensajes masivos generan spam. Las bases de datos tradicionales son frías y
                  no miden el <span className="font-semibold">compromiso real</span> de las personas.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--primary)]/25 bg-[var(--primary)]/[0.06] p-6 shadow-sm ring-1 ring-[var(--primary)]/15 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">La solución afini.app</p>
                <p className="mt-3 text-base leading-relaxed text-[var(--foreground)]">
                  Creamos enlaces universales para tus embajadores. Cada clic abre una conversación fluida donde nuestra
                  IA descubre <span className="font-semibold">qué tan afín</span> es esa persona con tu proyecto.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Motor de afinidad */}
        <section
          id="motor"
          className="border-y border-[var(--border)] bg-[var(--background)] px-4 py-14 sm:py-16"
          aria-labelledby="motor-heading"
        >
          <div className="mx-auto max-w-5xl">
            <h2 id="motor-heading" className="font-display text-center text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
              <span aria-hidden>🧠 </span>
              ¿Cómo funciona nuestro motor de afinidad?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Olvídate de los formularios estáticos. Transformamos la recolección de datos en una charla natural en tres
              pasos:
            </p>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-sm">
                <span className="text-2xl" aria-hidden>
                  💬
                </span>
                <h3 className="font-display mt-3 text-lg font-semibold text-[var(--foreground)]">Interactúa</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">El filtro</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  El usuario hace clic en tu enlace y conversa con la IA, expresando necesidades con fricción mínima.
                </p>
              </li>
              <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-sm">
                <span className="text-2xl" aria-hidden>
                  ⚡
                </span>
                <h3 className="font-display mt-3 text-lg font-semibold text-[var(--foreground)]">Analiza</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                  Cruce en tiempo real
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  La IA contrasta las respuestas con las metas, productos o propuestas definidas para tu campaña.
                </p>
              </li>
              <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-sm">
                <span className="text-2xl" aria-hidden>
                  🎯
                </span>
                <h3 className="font-display mt-3 text-lg font-semibold text-[var(--foreground)]">Califica</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">El resultado</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  Obtienes un <strong className="text-[var(--foreground)]">Affinity Score</strong> (0% a 100%) y la
                  clasificación de sentimiento: positivo, neutral o negativo. Así sabes quién está listo para apoyarte o
                  comprar.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* 4. Privacidad */}
        <section className="px-4 py-14 sm:py-16" aria-labelledby="privacidad-heading">
          <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center shadow-sm sm:px-10">
            <h2 id="privacidad-heading" className="font-display text-xl font-semibold text-[var(--foreground)] sm:text-2xl">
              Inteligencia accionable. Privacidad garantizada.
            </h2>
            <p className="mt-4 text-left text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Trabajamos bajo un enfoque serio de protección de datos. Tus líderes o embajadores comparten enlaces, pero
              el control de quién accede a la información sensible queda en el{" "}
              <strong className="text-[var(--foreground)]">panel centralizado</strong>: tú decides a quién contactar
              después, en un entorno seguro, protegiendo tu marca y a las personas que participan.
            </p>
          </div>
        </section>

        {/* 5. Casos de uso */}
        <section id="casos" className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-14 sm:py-16" aria-labelledby="casos-heading">
          <div className="mx-auto max-w-5xl">
            <h2 id="casos-heading" className="font-display text-center text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
              Casos de uso
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--muted)] sm:text-base">
              Un mismo motor para equipos que necesitan medir afinidad real, no solo clics.
            </p>
            <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {useCases.map((item) => (
                <li
                  key={item.title}
                  className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:border-[var(--primary)]/20 hover:shadow-md"
                >
                  <span className="text-2xl" aria-hidden>
                    {item.icon}
                  </span>
                  <h3 className="font-display mt-3 text-base font-semibold text-[var(--foreground)]">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-105 sm:w-auto"
              >
                Crear mi campaña gratis
              </Link>
              <Link
                href="/c/demo/demo-token-1"
                className="inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--border)]/40 sm:w-auto"
              >
                Ver demo
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
