import Link from "next/link";
import { listAllCampaigns } from "@/app/actions/super-admin";

export default async function SuperAdminHomePage() {
  const campaigns = await listAllCampaigns();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Super administrador</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Campañas, límites de líderes y asignación de administradores.</p>
        </div>
        <Link
          href="/dashboard/super-admin/campaigns/new"
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
        >
          Nueva campaña
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-[var(--border)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Líderes</th>
              <th className="px-4 py-3 font-medium">Votantes</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b border-[var(--border)]/80 last:border-0">
                <td className="px-4 py-3 font-medium text-[var(--foreground)]">{c.name}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{c.slug}</td>
                <td className="px-4 py-3">{c._count.leaders}</td>
                <td className="px-4 py-3">{c._count.voters}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/super-admin/campaigns/${c.id}`}
                    className="font-medium text-[var(--primary)] hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {campaigns.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">No hay campañas todavía.</p>
        ) : null}
      </div>
    </div>
  );
}
