/**
 * Cliente Prisma singleton (evita múltiples instancias en hot-reload de Next.js en desarrollo).
 * @packageDocumentation
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

/** Instancia compartida para consultas a PostgreSQL. */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
