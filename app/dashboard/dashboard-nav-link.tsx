"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const base =
  "inline-flex min-h-[44px] shrink-0 snap-start items-center rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-200 [-webkit-tap-highlight-color:transparent] active:scale-[0.98]";

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  /** "Inicio" solo coincide con `/dashboard`, sin subrutas. */
  if (href === "/dashboard") return false;
  /**
   * `/dashboard/super-admin` no debe marcarse activo en `/dashboard/super-admin/super-users`
   * (prefijo común). Sí debe activarse en campañas del súper admin (`/campaigns/...`).
   */
  if (href === "/dashboard/super-admin") {
    if (!pathname.startsWith("/dashboard/super-admin/")) return false;
    return !pathname.startsWith("/dashboard/super-admin/super-users");
  }
  return pathname.startsWith(href + "/");
}

/**
 * Enlace de la barra del panel; estado activo con `usePathname` en el cliente.
 * La lista según rol se define en el servidor (evita errores de hidratación).
 */
export function DashboardNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname() ?? "";
  const active = isNavActive(pathname, href);

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
