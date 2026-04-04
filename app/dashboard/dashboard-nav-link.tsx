"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const base =
  "inline-flex min-h-[44px] shrink-0 snap-start items-center rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-200 [-webkit-tap-highlight-color:transparent] active:scale-[0.98]";

/**
 * Enlace de la barra del panel; estado activo con `usePathname` en el cliente.
 * La lista según rol se define en el servidor (evita errores de hidratación).
 */
export function DashboardNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname() ?? "";
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      className={`${base} ${
        active
          ? "bg-[var(--primary)]/12 text-[var(--primary)] shadow-sm ring-1 ring-[var(--primary)]/20"
          : "text-[var(--muted)] hover:bg-[var(--border)]/80 hover:text-[var(--foreground)]"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
