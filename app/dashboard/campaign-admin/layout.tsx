import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CampaignAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CAMPAIGN_ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }
  return children;
}
