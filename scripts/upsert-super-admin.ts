/**
 * Crea o actualiza un usuario con rol SUPER_ADMIN (misma lógica que el login: bcrypt).
 *
 * Uso (no commitear secretos):
 *   DATABASE_URL="postgresql://..." SUPER_ADMIN_EMAIL="correo@dominio.com" SUPER_ADMIN_PASSWORD="..." npx tsx scripts/upsert-super-admin.ts
 */
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SUPER_ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Definir SUPER_ADMIN_EMAIL y SUPER_ADMIN_PASSWORD.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("Definir DATABASE_URL (Neon, etc.).");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main(adminEmail: string, adminPassword: string) {
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
    },
    update: {
      passwordHash,
      role: UserRole.SUPER_ADMIN,
    },
  });
  console.log(`Listo: SUPER_ADMIN ${user.email} (id ${user.id}).`);
}

main(email, password)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
