import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  switch (session.user.role) {
    case "SUPER_ADMIN":
      redirect("/dashboard/super-admin");
    case "CAMPAIGN_ADMIN":
      redirect("/dashboard/campaign-admin");
    case "LEADER":
      redirect("/dashboard/leader");
    default:
      redirect("/login");
  }
}
