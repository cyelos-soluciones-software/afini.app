import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignForSuperAdmin } from "@/app/actions/super-admin";
import { AssignAdminForm, CampaignEditForm } from "./campaign-edit-forms";

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getCampaignForSuperAdmin(id);
  if (!campaign) notFound();

  return (
    <div className="space-y-10">
      <div>
        <Link href="/dashboard/super-admin" className="text-sm text-[var(--primary)] hover:underline">
          ← Campañas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{campaign.name}</h1>
        <p className="text-sm text-[var(--muted)]">Slug: {campaign.slug}</p>
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-lg font-medium text-[var(--foreground)]">Datos de la campaña</h2>
        <CampaignEditForm campaign={campaign} />
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-lg font-medium text-[var(--foreground)]">Administradores de campaña</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-[var(--muted)]">
          {campaign.admins.map((a) => (
            <li key={a.id}>{a.user.email}</li>
          ))}
        </ul>
        <AssignAdminForm campaignId={campaign.id} />
        <p className="mt-2 text-xs text-[var(--muted)]">
          Si el correo ya existe como administrador de campaña, solo se vincula. Si es nuevo, se crea la cuenta con la contraseña indicada.
        </p>
      </section>

      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link href={`/dashboard/campaign-admin/${campaign.id}`} className="font-medium text-[var(--primary)] hover:underline">
          Gestionar preguntas, misiones y líderes →
        </Link>
        <Link href={`/dashboard/campaign-admin/${campaign.id}/mapa`} className="font-medium text-[var(--primary)] hover:underline">
          Mapa de calor (intención de voto) →
        </Link>
      </p>
    </div>
  );
}
