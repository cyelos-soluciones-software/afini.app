import Link from "next/link";

export const metadata = {
  title: "Política de privacidad",
  description:
    "Política de privacidad de afini.app (producto de Cyelos Soluciones de Software). Tratamiento de datos conforme a legislación colombiana.",
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:py-12">
      <header className="space-y-2">
        <Link href="/" className="text-sm font-medium text-[var(--primary)] hover:underline">
          ← Inicio
        </Link>
        <h1 className="font-display text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">Política de privacidad</h1>
        <p className="text-sm text-[var(--muted)]">
          Última actualización: 7 de abril de 2026
        </p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-[var(--foreground)]">
        <p className="text-[var(--muted)]">
          <strong className="text-[var(--foreground)]">afini.app</strong> es un producto de{" "}
          <strong className="text-[var(--foreground)]">Cyelos Soluciones de Software</strong> (Colombia), quien actúa como
          responsable/encargado del tratamiento de datos conforme aplique.
        </p>
        <p className="text-[var(--muted)]">
          Esta política describe qué datos recolectamos, con qué finalidad, cómo los protegemos y cuáles son tus derechos.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">1. Marco legal (Colombia)</h2>
        <p className="text-sm text-[var(--muted)]">
          El tratamiento de datos personales se sustenta, entre otras normas, en la{" "}
          <strong className="text-[var(--foreground)]">Ley 1581 de 2012</strong>, el{" "}
          <strong className="text-[var(--foreground)]">Decreto 1377 de 2013</strong> y las directrices de la{" "}
          <strong className="text-[var(--foreground)]">Superintendencia de Industria y Comercio (SIC)</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">2. Datos que podemos recolectar</h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--muted)]">
          <li>
            <strong className="text-[var(--foreground)]">Datos de contacto</strong> que el ciudadano decide suministrar en
            el funnel (por ejemplo: nombre, teléfono, barrio u otros campos configurados por campaña).
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Respuestas</strong> a preguntas y su análisis (p. ej. puntaje de
            afinidad o sentimiento generado por IA).
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Ubicación aproximada</strong> (latitud/longitud) solo si el
            ciudadano otorga permiso de geolocalización en el navegador.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Datos técnicos</strong> mínimos para seguridad y operación (por
            ejemplo: logs, información de sesión, prevención de abuso).
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">3. Finalidades</h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-[var(--muted)]">
          <li>Operar el funnel y el panel de control por rol (administradores y líderes).</li>
          <li>Generar inteligencia accionable: métricas agregadas, clasificaciones IA y reportes.</li>
          <li>Mejorar la calidad del servicio, seguridad y prevención de fraude/abuso.</li>
          <li>Cumplir obligaciones legales aplicables.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">4. Privacidad y acceso</h2>
        <p className="text-sm text-[var(--muted)]">
          afini.app está diseñada para reducir exposición innecesaria de datos. El acceso a información depende del rol
          (por ejemplo: líderes, administradores de campaña y súper administradores) y se limita por campaña.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">5. Conservación y seguridad</h2>
        <p className="text-sm text-[var(--muted)]">
          Aplicamos medidas técnicas y organizacionales razonables para proteger los datos (controles de acceso, cifrado
          en tránsito, registros y prácticas de seguridad). Conservamos la información durante el tiempo necesario para
          las finalidades descritas o según obligaciones legales/contractuales.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">6. Derechos del titular</h2>
        <p className="text-sm text-[var(--muted)]">
          El titular puede ejercer los derechos de conocer, actualizar, rectificar y solicitar supresión de sus datos,
          así como revocar la autorización, cuando proceda, conforme a la normativa colombiana.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">7. Contacto</h2>
        <p className="text-sm text-[var(--muted)]">
          Para solicitudes relacionadas con privacidad y tratamiento de datos, escribe a{" "}
          <a className="font-medium text-[var(--primary)] hover:underline" href="mailto:oscar.bernal@cyelos.com">
            oscar.bernal@cyelos.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}

