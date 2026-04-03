"use client";

import { signOut } from "next-auth/react";

export function DashboardSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--border)]/50 active:scale-[0.98]"
    >
      Salir
    </button>
  );
}
