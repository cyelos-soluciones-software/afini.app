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
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-2.5 transition-opacity hover:opacity-90 sm:gap-3">
            <LogoCyelos priority className="shrink-0 object-left" />
            <span className="hidden h-8 w-px shrink-0 bg-[var(--border)] sm:block" aria-hidden />
            <div className="min-w-0 flex-col sm:flex">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)] sm:text-xs sm:tracking-widest">
                Afini
              </span>
              <span className="truncate text-[10px] leading-tight text-[var(--muted)] sm:text-[11px]">
                Redes de afinidad
              </span>
            </div>
          </Link>
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <span
              className="hidden max-w-[min(200px,45vw)] truncate text-sm text-[var(--muted)] md:inline"
              title={session.user.email ?? ""}
            >
              {session.user.email}
            </span>
            <DashboardSignOut />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl">
        <DashboardNav />
        <main className="px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))]">{children}</main>
      </div>
    </div>
  );
}
