import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FunnelClient } from "./funnel-client";

export default async function FunnelPage({
  params,
}: {
  params: Promise<{ campaignSlug: string; leaderToken: string }>;
}) {
  const { campaignSlug, leaderToken } = await params;

  const leader = await prisma.leaderProfile.findFirst({
    where: {
      uniqueUrlToken: leaderToken,
      campaign: { slug: campaignSlug },
    },
    include: {
      campaign: {
        include: {
          questions: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!leader) {
    notFound();
  }

  if (leader.campaign.questions.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-[var(--muted)]">
        Esta campaña aún no tiene preguntas configuradas. Vuelve más tarde.
      </div>
    );
  }

  return (
    <FunnelClient
      campaignSlug={campaignSlug}
      leaderToken={leaderToken}
      campaign={{
        name: leader.campaign.name,
        slogan: leader.campaign.slogan,
        description: leader.campaign.description,
      }}
      questions={leader.campaign.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
      }))}
    />
  );
}
