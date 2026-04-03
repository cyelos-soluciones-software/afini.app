import { auth } from "@/auth";
import type { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }
  return session;
}

export async function requireRole(...allowed: UserRole[]) {
  const session = await requireAuth();
  if (!allowed.includes(session.user.role)) {
    redirect("/dashboard");
  }
  return session;
}
