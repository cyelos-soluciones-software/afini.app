"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { requireRole } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export async function getLeaderDashboard() {
  const session = await requireRole("LEADER");
  const profile = await prisma.leaderProfile.findFirst({
    where: { userId: session.user.id },
    include: {
      campaign: true,
      _count: { select: { voters: true } },
    },
  })
  if (!profile) return null;

  const missions = await prisma.mission.findMany({
    where: { campaignId: profile.campaignId },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      acks: {
        where: { leaderProfileId: profile.id },
        take: 1,
      },
    },
  });

  return { profile, missions };
}

export async function ackMissionAction(missionId: string) {
  const session = await requireRole("LEADER");
  const profile = await prisma.leaderProfile.findFirst({
    where: { userId: session.user.id },
  });
  if (!profile) throw new Error("Perfil de líder no encontrado");

  const mission = await prisma.mission.findFirst({
    where: { id: missionId, campaignId: profile.campaignId },
  });
  if (!mission) throw new Error("Misión no encontrada");

  await prisma.missionAck.upsert({
    where: {
      missionId_leaderProfileId: {
        missionId,
        leaderProfileId: profile.id,
      },
    },
    create: {
      missionId,
      leaderProfileId: profile.id,
    },
    update: {},
  });

  await writeAuditLog({
    userId: session.user.id,
    email: session.user.email,
    action: "mission_ack",
    entity: "Mission",
    entityId: missionId,
  });

  revalidatePath("/dashboard/leader");
}
