import { UpgradePremiumCta } from "@/app/dashboard/campaign-admin/upgrade-premium-cta";
import { FREE_TIER_MAX_VOTERS_PER_CAMPAIGN } from "@/lib/plan-limits";

type Props = {
  campaignId: string;
  campaignName: string;
  /** Cupo de ciudadanos configurado (p. ej. 25 por defecto freemium o valor fijado por súper admin). */
  maxVoters: number;
  maxLeaders: number;
  leaderCount: number;
  premiumUnlocked: boolean;
};

/**
 * Aviso de límites del plan gratuito en una campaña concreta y CTA a ventas (Premium por campaña).
 */
export function CampaignPlanLimitsCallout({
  campaignId,
  campaignName,
  maxVoters,
  maxLeaders,
  leaderCount,
  premiumUnlocked,
}: Props) {
  if (premiumUnlocked) return null;

  const votersCap = maxVoters > 0 ? maxVoters : FREE_TIER_MAX_VOTERS_PER_CAMPAIGN;
  const atLeaders = leaderCount >= maxLeaders;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--foreground)]">
      <p className="font-medium">Plan gratuito en esta campaña</p>
      <p className="mt-2 text-[var(--muted)]">
        Puedes tener hasta <strong className="text-[var(--foreground)]">{maxLeaders}</strong> líder digital
        {maxLeaders === 1 ? "" : "es"} y hasta <strong className="text-[var(--foreground)]">{votersCap}</strong>{" "}
        ciudadanos analizados. Para más líderes, más ciudadanos u otras ampliaciones, el upgrade Premium se acuerda con
        ventas <strong className="text-[var(--foreground)]">por campaña</strong> (indica el nombre de esta campaña al
        contactar).
      </p>
      {atLeaders ? (
        <p className="mt-2 text-amber-800 dark:text-amber-200">
          Has alcanzado el máximo de líderes en esta campaña. Si necesitas más, usa el botón de abajo.
        </p>
      ) : null}
      <div className="mt-4">
        <UpgradePremiumCta campaignId={campaignId} campaignName={campaignName} />
      </div>
    </div>
  );
}
