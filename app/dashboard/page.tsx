import { CampaignAdminHomeDashboard } from "@/app/components/campaign-admin-home-dashboard";
import { SuperAdminHomeDashboard } from "@/app/components/super-admin-home-dashboard";
import { auth } from "@/auth";
import { countDistinctCampaignsAsAdmin } from "@/lib/plan-limits";
import { redirect } from "next/navigation";

export default async function DashboardIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  switch (session.user.role) {
    case "SUPER_ADMIN": {
      const sp = await searchParams;
      return <SuperAdminHomeDashboard searchParams={sp} />;
    }
    case "CAMPAIGN_ADMIN": {
      const n = await countDistinctCampaignsAsAdmin(session.user.id);
      if (n === 0) redirect("/onboarding");
      const sp = await searchParams;
      return <CampaignAdminHomeDashboard userId={session.user.id} searchParams={sp} />;
    }
    case "LEADER":
      redirect("/dashboard/leader");
    default:
      redirect("/login");
  }
}
