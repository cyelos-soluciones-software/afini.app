import { auth } from "@/auth";
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
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <span className="font-semibold text-[var(--foreground)]">Eco · Cyelos</span>
          <div className="flex items-center gap-3">
            <span className="hidden truncate text-sm text-[var(--muted)] sm:inline">{session.user.email}</span>
            <DashboardSignOut />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl">
        <DashboardNav />
        <main className="px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
