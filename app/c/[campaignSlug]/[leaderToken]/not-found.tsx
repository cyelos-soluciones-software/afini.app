import Link from "next/link";

export default function FunnelNotFound() {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">Enlace no encontrado</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        El enlace de campaña o líder no es válido. Pide un enlace actualizado a tu contacto.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)]"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
