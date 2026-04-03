import Link from "next/link";
import { notFound } from "next/navigation";
import { assertCampaignAccess } from "@/app/actions/campaign-manager";
import { getParticipantResponsesPage } from "@/app/actions/participant-responses";
import { PARTICIPANT_RESPONSES_DEFAULT_PAGE_SIZE } from "@/lib/participant-responses-types";
import { ParticipantResponsesTable } from "@/app/components/participant-responses-table";
import { prisma } from "@/lib/prisma";

export default async function ParticipantResponsesPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { campaignId } = await params;
  const sp = await searchParams;

  await assertCampaignAccess(campaignId);

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { name: true },
  });
  if (!campaign) notFound();

  const rawPage = sp.page;
  const pageNum = Math.max(1, parseInt(typeof rawPage === "string" ? rawPage : "1", 10) || 1);

  const [questions, data] = await Promise.all([
    prisma.question.findMany({
      where: { campaignId },
      orderBy: { sortOrder: "asc" },
      select: { id: true, questionText: true },
    }),
    getParticipantResponsesPage(campaignId, pageNum, PARTICIPANT_RESPONSES_DEFAULT_PAGE_SIZE),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/dashboard/campaign-admin/${campaignId}`} className="text-sm text-[var(--primary)] hover:underline">
          ← Volver a la campaña
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Respuestas ciudadanas</h1>
        <p className="mt-1">
          <Link
            href={`/dashboard/campaign-admin/${campaignId}/mapa`}
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            Mapa de calor por intención de voto →
          </Link>
        </p>
      </div>

      <ParticipantResponsesTable
        campaignId={campaignId}
        campaignName={campaign.name}
        questions={questions}
        data={data}
      />
    </div>
  );
}
