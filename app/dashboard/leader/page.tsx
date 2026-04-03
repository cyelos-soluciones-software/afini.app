import { redirect } from "next/navigation";
import { ackMissionAction, getLeaderDashboard } from "@/app/actions/leader";
import { getPublicBaseUrl } from "@/lib/app-url";

export default async function LeaderDashboardPage() {
  const data = await getLeaderDashboard();
  if (!data) {
    redirect("/dashboard");
  }

  const { profile, missions } = data;
  const base = getPublicBaseUrl();
  const funnelUrl = `${base}/c/${profile.campaign.slug}/${profile.uniqueUrlToken}`;
  const shareText = `¡Participa en ${profile.campaign.name}! ${funnelUrl}`;
  const waMeShare = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">{profile.campaign.name}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Tu enlace único de referido y misiones de difusión.</p>
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--primary)]">Tu impacto</h2>
        <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{profile._count.voters}</p>
        <p className="text-sm text-[var(--muted)]">Personas referidas registradas en esta campaña.</p>
      </section>

      <section className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-medium text-[var(--foreground)]">Compartir campaña</h2>
        <p className="text-sm text-[var(--muted)]">Copia el enlace o abre WhatsApp con un mensaje prefabricado.</p>
        <div className="break-all rounded-lg bg-[var(--background)] px-3 py-2 font-mono text-xs text-[var(--foreground)]">{funnelUrl}</div>
        <div className="flex flex-wrap gap-2">
          <a
            href={waMeShare}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
          >
            Compartir en WhatsApp
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-[var(--foreground)]">Misiones</h2>
        <div className="rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <strong>Sugerencia (Meta):</strong> envía estos mensajes solo a tus grupos o a un máximo de ~20 contactos por
          hora. Espera antes de repetir para reducir riesgo de bloqueo por spam.
        </div>
        <ul className="space-y-4">
          {missions.map((m) => {
            const waMission = `https://wa.me/?text=${encodeURIComponent(m.messageBody)}`;
            const seen = m.acks.length > 0;
            return (
              <li key={m.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{m.title}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted)]">{m.messageBody}</p>
                  </div>
                  {seen ? (
                    <span className="rounded-full bg-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">Vista</span>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={ackMissionAction.bind(null, m.id)}>
                    <button
                      type="submit"
                      className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]/40"
                    >
                      Marcar como vista
                    </button>
                  </form>
                  <a
                    href={waMission}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                  >
                    Abrir WhatsApp
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
        {missions.length === 0 ? <p className="text-sm text-[var(--muted)]">No hay misiones todavía.</p> : null}
      </section>

      <p className="text-sm text-[var(--muted)]">Las métricas agregadas de la campaña las consulta el administrador.</p>
    </div>
  );
}
