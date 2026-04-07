import Link from "next/link";
import { listAccessibleCampaigns } from "@/app/actions/campaign-manager";
import { UpgradePremiumCta } from "@/app/dashboard/campaign-admin/upgrade-premium-cta";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  FREE_TIER_MAX_LEADERS_PER_CAMPAIGN,
  FREE_TIER_MAX_VOTERS_PER_CAMPAIGN,
} from "@/lib/plan-limits";

type SearchParams = { q?: string };

export default async function CampaignAdminHomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const campaigns = await listAccessibleCampaigns({ q });
  const plan =
    session?.user?.id && session.user.role === "CAMPAIGN_ADMIN"
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { billingPlan: true },
        })
      : null;

  const isCampaignAdmin = session?.user?.role === "CAMPAIGN_ADMIN";

  return (
    <div className="space-y-6">
      {isCampaignAdmin && plan?.billingPlan === "FREE" ? (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--foreground)]">
            <span className="font-medium">Plan gratuito (por cada campaña):</span> hasta{" "}
            {FREE_TIER_MAX_LEADERS_PER_CAMPAIGN} líder digital y hasta {FREE_TIER_MAX_VOTERS_PER_CAMPAIGN} ciudadanos.
            Puedes crear todas las campañas que necesites; para ampliar límites u opciones en una campaña concreta,
            el acuerdo Premium es <span className="font-medium">por campaña</span> — indica cuál al contactar ventas.
          </p>
          <UpgradePremiumCta />
        </div>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/dashboard" className="text-sm font-medium text-[var(--primary)] hover:underline">
            ← Inicio
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Campañas</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Orden: más recientes primero. Filtra por nombre o slug.
          </p>
        </div>
        {isCampaignAdmin ? (
          <Link
            href="/dashboard/campaign-admin/new"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
          >
            Nueva campaña
          </Link>
        ) : null}
      </div>

      <form method="get" className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="camp-q" className="sr-only">
            Buscar campaña
          </label>
          <input
            id="camp-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Nombre o slug…"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
        >
          Filtrar
        </button>
        {q.trim() ? (
          <Link
            href="/dashboard/campaign-admin"
            className="rounded-lg px-3 py-2 text-sm text-[var(--primary)] hover:underline"
          >
            Limpiar
          </Link>
        ) : null}
      </form>

      <ul className="space-y-2">
        {campaigns.map((c) => (
          <li key={c.id}>
            <Link
              href={`/dashboard/campaign-admin/${c.id}`}
              className="flex flex-col gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--border)]/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <span>{c.name}</span>
              <span className="text-xs font-normal text-[var(--muted)]">
                {c.createdAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
                · <code className="rounded bg-[var(--border)]/50 px-1">{c.slug}</code> →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {campaigns.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {q.trim()
            ? "No hay campañas que coincidan con la búsqueda."
            : session?.user?.role === "SUPER_ADMIN"
              ? "No hay campañas creadas todavía."
              : "No tienes campañas asignadas. Pide acceso a un super administrador o crea una con “Nueva campaña”."}
        </p>
      ) : null}
    </div>
  );
}
