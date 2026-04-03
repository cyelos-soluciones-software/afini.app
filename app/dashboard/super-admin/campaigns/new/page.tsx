import Link from "next/link";
import { NewCampaignForm } from "./new-campaign-form";

export default function NewCampaignPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/dashboard/super-admin" className="text-sm text-[var(--primary)] hover:underline">
          ← Volver
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Nueva campaña</h1>
      </div>
      <NewCampaignForm />
    </div>
  );
}
