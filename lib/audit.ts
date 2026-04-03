import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function writeAuditLog(data: {
  userId?: string | null;
  email?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ip?: string | null;
  userAgent?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId ?? undefined,
        email: data.email ?? undefined,
        action: data.action,
        entity: data.entity ?? undefined,
        entityId: data.entityId ?? undefined,
        metadata: data.metadata ?? undefined,
        ip: data.ip ?? undefined,
        userAgent: data.userAgent ?? undefined,
      },
    });
  } catch (e) {
    console.error("[audit] write failed", e);
  }
}
