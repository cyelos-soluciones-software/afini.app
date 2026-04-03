"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Evita importar `@prisma/client` en el bundle cliente. */
export type DashboardNavRole = "SUPER_ADMIN" | "CAMPAIGN_ADMIN" | "LEADER";

const base =
  "inline-flex min-h-[44px] min-w-[44px] items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 active:scale-[0.98]";

/**
 * Navegación del panel con estado activo y áreas táctiles adecuadas para PWA móvil.
 */
export function DashboardNavLinks({ role }: { role: DashboardNavRole }) {
  const pathname = usePathname() ?? "";

  function item(href: string, label: string) {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
    return (
      <Link
        href={href}
        className={`${base} ${
          active
            ? "bg-[var(--primary)]/14 text-[var(--primary)] shadow-sm ring-1 ring-[var(--primary)]/25"
            : "text-[var(--muted)] hover:bg-[var(--border)]/70 hover:text-[var(--foreground)]"
        }`}
        aria-current={active ? "page" : undefined}
      >
        {label}
      </Link>
    );
  }

  return (
    <nav className="flex flex-wrap items-center gap-1.5 px-4 py-2.5" aria-label="Panel principal">
      {item("/dashboard", "Inicio")}
      {role === "SUPER_ADMIN" ? item("/dashboard/super-admin", "Super admin") : null}
      {role === "CAMPAIGN_ADMIN" || role === "SUPER_ADMIN" ? item("/dashboard/campaign-admin", "Campañas") : null}
      {role === "LEADER" ? item("/dashboard/leader", "Mi campaña") : null}
    </nav>
  );
}
