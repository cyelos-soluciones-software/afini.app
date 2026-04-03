import Link from "next/link";
import { auth } from "@/auth";

export async function DashboardNav() {
  const session = await auth();
  if (!session?.user) return null;
  const r = session.user.role;
  const link =
    "rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--border)]/60 hover:text-[var(--foreground)]";

  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-[var(--border)] px-4 py-2">
      <Link href="/dashboard" className={link}>
        Inicio
      </Link>
      {r === "SUPER_ADMIN" ? (
        <Link href="/dashboard/super-admin" className={link}>
          Super admin
        </Link>
      ) : null}
      {r === "CAMPAIGN_ADMIN" || r === "SUPER_ADMIN" ? (
        <Link href="/dashboard/campaign-admin" className={link}>
          Campañas
        </Link>
      ) : null}
      {r === "LEADER" ? (
        <Link href="/dashboard/leader" className={link}>
          Mi campaña
        </Link>
      ) : null}
    </nav>
  );
}
