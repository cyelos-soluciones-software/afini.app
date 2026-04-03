/**
 * Helpers de sesión para Server Components y Server Actions: redirección si falta auth o rol.
 * @packageDocumentation
 */
import { auth } from "@/auth";
import type { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

/**
 * @returns Sesión con usuario autenticado.
 * @remarks Si no hay sesión, ejecuta `redirect` a `/login?callbackUrl=/dashboard` (no retorna).
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }
  return session;
}

/**
 * @param allowed - Uno o más roles permitidos.
 * @returns Sesión si el rol del usuario está en `allowed`.
 * @remarks Si el rol no está permitido, `redirect` a `/dashboard` (no retorna).
 */
export async function requireRole(...allowed: UserRole[]) {
  const session = await requireAuth();
  if (!allowed.includes(session.user.role)) {
    redirect("/dashboard");
  }
  return session;
}
