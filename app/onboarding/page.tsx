import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoCyelos } from "@/app/components/brand-logos";
import { OnboardingForm } from "@/app/onboarding/onboarding-form";
import { countDistinctCampaignsAsAdmin } from "@/lib/plan-limits";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/onboarding");
  if (session.user.role !== "CAMPAIGN_ADMIN") redirect("/dashboard");

  const n = await countDistinctCampaignsAsAdmin(session.user.id);
  if (n > 0) redirect("/dashboard/campaign-admin");

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <LogoCyelos priority className="mx-auto block h-10 max-w-[200px] object-center" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Afini</p>
        <h1 className="font-display mt-3 text-2xl font-semibold text-[var(--foreground)]">Crea tu primera campaña</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Dale un nombre a tu campaña. Luego podrás añadir preguntas del funnel, líderes y misiones desde el panel.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
