import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NewCampaignFromDashboardForm } from "./new-campaign-form";

export default async function NewCampaignPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/campaign-admin/new");
  if (session.user.role !== "CAMPAIGN_ADMIN") redirect("/dashboard/campaign-admin");

  return (
    <div className="mx-auto max-w-lg space-y-6 py-4">
      <Link href="/dashboard/campaign-admin" className="text-sm text-[var(--primary)] hover:underline">
        ← Campañas
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Nueva campaña</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Cada campaña tiene sus propios límites en plan gratuito; el Premium se acuerda por campaña con ventas.
        </p>
      </div>
      <NewCampaignFromDashboardForm />
    </div>
  );
}
