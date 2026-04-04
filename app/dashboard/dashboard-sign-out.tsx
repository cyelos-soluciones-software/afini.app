"use client";

import { signOut } from "next-auth/react";

export function DashboardSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--primary)] transition hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 active:scale-[0.98]"
    >
      Cerrar sesión
    </button>
  );
}
