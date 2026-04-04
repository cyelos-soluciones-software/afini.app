import Link from "next/link";
import { auth } from "@/auth";
import { listSuperAdmins } from "@/app/actions/super-admin";
import {
  CreateSuperAdminForm,
  DeleteSuperAdminInline,
} from "@/app/dashboard/super-admin/super-users/super-user-forms";

export default async function SuperUsersPage() {
  const [session, admins] = await Promise.all([auth(), listSuperAdmins()]);
  const currentId = session?.user?.id ?? "";
  const canDeleteAny = admins.length > 1;

  return (
    <div className="space-y-10">
      <div>
        <Link href="/dashboard/super-admin" className="text-sm font-medium text-[var(--primary)] hover:underline">
          ← Administración global
        </Link>
        <h1 className="font-display mt-2 text-2xl font-semibold text-[var(--foreground)]">Equipo admin</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Cuentas con acceso total al sistema. Debe quedar al menos una activa.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <CreateSuperAdminForm />
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Cuentas registradas</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {admins.length} {admins.length === 1 ? "administrador global" : "administradores globales"}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead className="border-b border-[var(--border)] text-[var(--muted)]">
                <tr>
                  <th className="py-2 pr-3 font-medium">Correo</th>
                  <th className="hidden py-2 pr-3 font-medium sm:table-cell">Alta</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {admins.map((u) => {
                  const isSelf = u.id === currentId;
                  const canDelete = canDeleteAny && !isSelf;
                  return (
                    <tr key={u.id} className="border-b border-[var(--border)]/70 last:border-0">
                      <td className="py-3 pr-3">
                        <span className="font-medium text-[var(--foreground)]">{u.email}</span>
                        {isSelf ? (
                          <span className="ml-2 rounded-md bg-[var(--primary)]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">
                            Tú
                          </span>
                        ) : null}
                      </td>
                      <td className="hidden py-3 pr-3 text-[var(--muted)] sm:table-cell">
                        {u.createdAt.toLocaleDateString("es-CO", { dateStyle: "medium" })}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <Link
                            href={`/dashboard/super-admin/super-users/${u.id}`}
                            className="text-sm font-medium text-[var(--primary)] hover:underline"
                          >
                            Editar
                          </Link>
                          <DeleteSuperAdminInline userId={u.id} disabled={!canDelete} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
