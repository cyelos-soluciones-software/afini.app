import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getSuperAdminForEdit } from "@/app/actions/super-admin";
import {
  DeleteSuperAdminForm,
  UpdateSuperAdminForm,
} from "@/app/dashboard/super-admin/super-users/super-user-forms";
import { prisma } from "@/lib/prisma";

export default async function EditSuperUserPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const [session, user] = await Promise.all([auth(), getSuperAdminForEdit(userId)]);
  if (!user) notFound();

  const isSelf = session?.user?.id === userId;
  const adminsCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
  const canDelete = adminsCount > 1 && !isSelf;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/super-admin/super-users" className="text-sm font-medium text-[var(--primary)] hover:underline">
          ← Equipo admin
        </Link>
        <h1 className="font-display mt-2 text-2xl font-semibold text-[var(--foreground)]">Editar administrador global</h1>
        <p className="mt-1 font-mono text-sm text-[var(--muted)]">{user.email}</p>
      </div>

      <UpdateSuperAdminForm userId={user.id} currentEmail={user.email} />

      <DeleteSuperAdminForm userId={user.id} email={user.email} disabled={!canDelete} />
      {!canDelete ? (
        <p className="text-sm text-[var(--muted)]">
          {isSelf
            ? "No puedes eliminar tu propia cuenta desde aquí."
            : "No se puede eliminar el único administrador global del sistema."}
        </p>
      ) : null}
    </div>
  );
}
