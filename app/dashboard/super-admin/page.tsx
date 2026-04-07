import Link from "next/link";
import { listCampaignsPaginated } from "@/app/actions/super-admin";

type SearchParams = { page?: string; q?: string };

export default async function SuperAdminHomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const q = typeof sp.q === "string" ? sp.q : "";
  const { items, total, page: currentPage, pageSize, totalPages } = await listCampaignsPaginated({
    page,
    q,
  });

  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(total, currentPage * pageSize);

  function hrefForPage(p: number) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/dashboard/super-admin?${s}` : "/dashboard/super-admin";
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-sm font-medium text-[var(--primary)] hover:underline">
            ← Inicio
          </Link>
          <h1 className="font-display mt-2 text-2xl font-semibold text-[var(--foreground)]">Administración global</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Campañas (más recientes primero), cupos de líderes y ciudadanos, administradores y equipo con acceso total.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/super-admin/super-users"
            className="min-h-[44px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]/40"
          >
            Equipo admin
          </Link>
          <Link
            href="/dashboard/super-admin/campaigns/new"
            className="min-h-[44px] rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-105"
          >
            Nueva campaña
          </Link>
        </div>
      </div>

      <form
        method="get"
        action="/dashboard/super-admin"
        className="flex max-w-2xl flex-col gap-2 sm:flex-row sm:items-center"
      >
        <label htmlFor="super-campaign-q" className="sr-only">
          Buscar campaña
        </label>
        <input
          id="super-campaign-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Filtrar por nombre o slug…"
          className="min-h-[44px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none ring-[var(--primary)] focus:ring-2"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="min-h-[44px] rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
          >
            Buscar
          </button>
          {q.trim() ? (
            <Link
              href="/dashboard/super-admin"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]/40"
            >
              Limpiar
            </Link>
          ) : null}
        </div>
      </form>

      <p className="text-xs text-[var(--muted)]">
        {total === 0
          ? "Sin resultados en esta vista."
          : `Mostrando ${from}–${to} de ${total} campaña${total === 1 ? "" : "s"} (${pageSize} por página).`}
      </p>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--border)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Creada</th>
              <th className="px-4 py-3 font-medium">Líderes</th>
              <th className="px-4 py-3 font-medium">Ciudadanos</th>
              <th className="px-4 py-3 font-medium">Cupo ciudadanos</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-[var(--border)]/80 last:border-0">
                <td className="px-4 py-3 font-medium text-[var(--foreground)]">{c.name}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{c.slug}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[var(--muted)]">
                  {new Intl.DateTimeFormat("es", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(c.createdAt))}
                </td>
                <td className="px-4 py-3">{c._count.leaders}</td>
                <td className="px-4 py-3">{c._count.voters}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{c.maxVoters.toLocaleString("es-CO")}</td>
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
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
            {q.trim() ? "Ninguna campaña coincide con el filtro." : "No hay campañas todavía."}
          </p>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <nav className="flex flex-wrap items-center justify-center gap-2 text-sm" aria-label="Paginación">
          <Link
            href={hrefForPage(currentPage - 1)}
            className={`rounded-lg border border-[var(--border)] px-3 py-2 font-medium ${
              currentPage <= 1 ? "pointer-events-none opacity-40" : "hover:bg-[var(--border)]/40"
            }`}
            aria-disabled={currentPage <= 1}
          >
            Anterior
          </Link>
          <span className="px-2 text-[var(--muted)]">
            Página {currentPage} de {totalPages}
          </span>
          <Link
            href={hrefForPage(currentPage + 1)}
            className={`rounded-lg border border-[var(--border)] px-3 py-2 font-medium ${
              currentPage >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-[var(--border)]/40"
            }`}
            aria-disabled={currentPage >= totalPages}
          >
            Siguiente
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
