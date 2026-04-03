/**
 * Registro de auditoría en base de datos (best-effort: errores solo se loguean en consola).
 * @packageDocumentation
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Inserta una fila en `AuditLog`. No relanza excepciones para no romper flujos críticos.
 * @param data.action - Identificador corto del evento (p. ej. `funnel_voter_created`).
 * @param data.metadata - JSON opcional con contexto adicional.
 */
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
