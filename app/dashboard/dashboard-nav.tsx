import { auth } from "@/auth";
import { DashboardNavLinks, type DashboardNavRole } from "@/app/dashboard/dashboard-nav-links";

export async function DashboardNav() {
  const session = await auth();
  if (!session?.user) return null;
  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md">
      <DashboardNavLinks role={session.user.role as DashboardNavRole} />
    </div>
  );
}
