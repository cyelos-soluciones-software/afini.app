import { requireRole } from "@/lib/auth-session";

export default async function LeaderLayout({ children }: { children: React.ReactNode }) {
  await requireRole("LEADER");
  return children;
}
