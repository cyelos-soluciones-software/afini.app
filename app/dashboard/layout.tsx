import Link from "next/link";
import { auth } from "@/auth";
import { LogoCyelos } from "@/app/components/brand-logos";
import { DashboardNav } from "@/app/dashboard/dashboard-nav";
import { DashboardSignOut } from "@/app/dashboard/dashboard-sign-out";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-full bg-[var(--background)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90">
            <LogoCyelos priority className="object-left" />
            <span className="hidden h-8 w-px bg-[var(--border)] sm:block" aria-hidden />
            <div className="hidden min-w-0 flex-col sm:flex">
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">Eco</span>
              <span className="truncate text-[11px] text-[var(--muted)]">Panel de campañas</span>
            </div>
          </Link>
          <div className="flex min-w-0 flex-shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[200px] truncate text-sm text-[var(--muted)] md:inline" title={session.user.email ?? ""}>
              {session.user.email}
            </span>
            <DashboardSignOut />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl">
        <DashboardNav />
        <main className="px-4 py-6 pb-8">{children}</main>
      </div>
    </div>
  );
}
