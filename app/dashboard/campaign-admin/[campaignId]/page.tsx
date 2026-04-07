import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignCharts } from "@/app/components/campaign-charts";
import { CampaignFreemiumBanner } from "@/app/components/campaign-freemium-banner";
import { CampaignPlanLimitsCallout } from "@/app/components/campaign-plan-limits-callout";
import { CopyLeaderAccessButton } from "@/app/components/copy-leader-access-button";
import { deleteQuestionAction, getCampaignAnalytics, getCampaignDetail } from "@/app/actions/campaign-manager";
import { campaignHasPremiumVoterBudget } from "@/lib/plan-limits";
import { ClosingCtaForm, NewLeaderForm, NewMissionForm, NewQuestionForm } from "./campaign-forms";

export default async function CampaignManagePage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const campaign = await getCampaignDetail(campaignId);
  if (!campaign) notFound();

  const analytics = await getCampaignAnalytics(campaignId);
  const premiumVoters = await campaignHasPremiumVoterBudget(campaignId);

  return (
    <div className="space-y-12">
      <CampaignFreemiumBanner
        voterCount={campaign._count.voters}
        premiumUnlocked={premiumVoters}
        maxVotersCap={campaign.maxVoters}
      />
      <CampaignPlanLimitsCallout
        campaignId={campaignId}
        campaignName={campaign.name}
        maxVoters={campaign.maxVoters}
        maxLeaders={campaign.maxLeaders}
        leaderCount={campaign._count.leaders}
        premiumUnlocked={premiumVoters}
      />
      <div>
        <Link href="/dashboard/campaign-admin" className="text-sm text-[var(--primary)] hover:underline">
          ← Campañas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{campaign.name}</h1>
        <p className="text-sm text-[var(--muted)]">
          Slug: <code className="rounded bg-[var(--border)] px-1">{campaign.slug}</code> · Líderes: {campaign._count.leaders} /{" "}
          {campaign.maxLeaders} · Votantes: {campaign._count.voters}
        </p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <Link
            href={`/dashboard/campaign-admin/${campaignId}/respuestas`}
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            Ver respuestas de participantes (sin datos de contacto) →
          </Link>
          <Link
            href={`/dashboard/campaign-admin/${campaignId}/mapa`}
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            Mapas de calor (intención de voto y sentimiento IA) →
          </Link>
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-[var(--foreground)]">Preguntas y respuestas (IA)</h2>
        <div className="space-y-3">
          {campaign.questions.map((q) => (
            <div
              key={q.id}
              className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm md:flex-row md:items-start md:justify-between"
            >
              <div>
                <p className="font-medium text-[var(--foreground)]">{q.questionText}</p>
                <p className="mt-1 text-[var(--muted)]">Oficial: {q.officialAnswer}</p>
                {q.geminiContext ? (
                  <p className="mt-1 text-xs text-[var(--muted)]">Contexto IA: {q.geminiContext}</p>
                ) : null}
              </div>
              <form action={deleteQuestionAction.bind(null, campaignId, q.id)}>
                <button type="submit" className="text-xs font-medium text-red-600 hover:underline">
                  Eliminar
                </button>
              </form>
            </div>
          ))}
        </div>
        <NewQuestionForm campaignId={campaignId} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-[var(--foreground)]">Misiones (difusión)</h2>
        <ul className="space-y-2">
          {campaign.missions.map((m) => (
            <li key={m.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
              <p className="font-medium">{m.title}</p>
              <p className="mt-1 whitespace-pre-wrap text-[var(--muted)]">{m.messageBody}</p>
            </li>
          ))}
        </ul>
        <NewMissionForm campaignId={campaignId} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-[var(--foreground)]">Líderes digitales</h2>
        <ul className="space-y-2 text-sm">
          {campaign.leaders.map((l) => (
            <li
              key={l.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2"
            >
              <span className="text-[var(--foreground)]">{l.user.email}</span>
              <div className="flex items-center gap-2">
                <span className="text-[var(--muted)]">{l._count.voters} referidos</span>
                <CopyLeaderAccessButton leaderEmail={l.user.email} />
              </div>
            </li>
          ))}
        </ul>
        <NewLeaderForm
          campaignId={campaignId}
          leaderCount={campaign._count.leaders}
          maxLeaders={campaign.maxLeaders}
          premiumUnlocked={premiumVoters}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-[var(--foreground)]">Experiencia al cerrar el funnel</h2>
        <p className="text-sm text-[var(--muted)]">
          Mensaje mostrado al ciudadano después de la conclusión IA (antes de compartir en redes).
        </p>
        <ClosingCtaForm campaignId={campaignId} defaultClosingCtaText={campaign.closingCtaText} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-[var(--foreground)]">Analítica</h2>
        <CampaignCharts data={analytics} />
      </section>
    </div>
  );
}
