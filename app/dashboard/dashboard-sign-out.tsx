"use client";

import { signOut } from "next-auth/react";

export function DashboardSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-[var(--primary)] hover:underline"
    >
      Salir
    </button>
  );
}
