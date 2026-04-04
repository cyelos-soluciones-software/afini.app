import { auth } from "@/auth";
import { DashboardNavLink } from "@/app/dashboard/dashboard-nav-link";

export async function DashboardNav() {
  const session = await auth();
  if (!session?.user) return null;

  const role = session.user.role;

  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      {/* En móvil: desplazamiento horizontal táctil; en escritorio: varias filas si hace falta */}
      <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
        <nav
          className="flex w-max max-w-none min-w-full flex-nowrap items-stretch gap-1.5 px-4 py-2.5 sm:w-full sm:max-w-full sm:flex-wrap sm:items-center"
          aria-label="Panel principal"
        >
          <DashboardNavLink href="/dashboard" label="Inicio" />
          {role === "SUPER_ADMIN" ? (
            <DashboardNavLink href="/dashboard/super-admin" label="Administración" />
          ) : null}
          {role === "SUPER_ADMIN" ? (
            <DashboardNavLink href="/dashboard/super-admin/super-users" label="Equipo admin" />
          ) : null}
          {role === "CAMPAIGN_ADMIN" || role === "SUPER_ADMIN" ? (
            <DashboardNavLink href="/dashboard/campaign-admin" label="Campañas" />
          ) : null}
          {role === "LEADER" ? <DashboardNavLink href="/dashboard/leader" label="Mi campaña" /> : null}
        </nav>
      </div>
    </div>
  );
}
