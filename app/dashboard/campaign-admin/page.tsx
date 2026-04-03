import Link from "next/link";
import { listAccessibleCampaigns } from "@/app/actions/campaign-manager";

export default async function CampaignAdminHomePage() {
  const campaigns = await listAccessibleCampaigns();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Campañas</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Gestiona preguntas, misiones, líderes y analítica.</p>
      </div>
      <ul className="space-y-2">
        {campaigns.map((c) => (
          <li key={c.id}>
            <Link
              href={`/dashboard/campaign-admin/${c.id}`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--border)]/30"
            >
              {c.name}
              <span className="text-[var(--muted)]">→</span>
            </Link>
          </li>
        ))}
      </ul>
      {campaigns.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No tienes campañas asignadas. Un super administrador debe asignarte.</p>
      ) : null}
    </div>
  );
}
