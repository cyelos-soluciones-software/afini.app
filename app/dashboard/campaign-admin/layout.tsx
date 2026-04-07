import { auth } from "@/auth";
import { countDistinctCampaignsAsAdmin } from "@/lib/plan-limits";
import { redirect } from "next/navigation";

export default async function CampaignAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CAMPAIGN_ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }
  if (session.user.role === "CAMPAIGN_ADMIN") {
    const n = await countDistinctCampaignsAsAdmin(session.user.id);
    if (n === 0) redirect("/onboarding");
  }
  return children;
}
