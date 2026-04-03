import { requireRole } from "@/lib/auth-session";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("SUPER_ADMIN");
  return children;
}
