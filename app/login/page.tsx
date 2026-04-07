import { auth } from "@/auth";
import { LogoCyelos } from "@/app/components/brand-logos";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/login/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  const googleEnabled =
    typeof process.env.GOOGLE_CLIENT_ID === "string" &&
    process.env.GOOGLE_CLIENT_ID.length > 0 &&
    typeof process.env.GOOGLE_CLIENT_SECRET === "string" &&
    process.env.GOOGLE_CLIENT_SECRET.length > 0;

  if (session?.user) {
    redirect(params.callbackUrl && params.callbackUrl.startsWith("/") ? params.callbackUrl : "/dashboard");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <LogoCyelos priority className="mx-auto block h-11 max-w-[220px] object-center" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Afini</p>
          <h1 className="font-display mt-2 text-xl font-semibold text-[var(--foreground)]">Acceso al panel</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Redes de afinidad, métricas y funnel según tu rol.</p>
        </div>
        <LoginForm
          callbackUrl={params.callbackUrl}
          googleEnabled={googleEnabled}
          errorCode={params.error ?? null}
        />
        <p className="text-center text-[11px] leading-relaxed text-[var(--muted)]">
          ¿Primera vez en el móvil? Después de entrar puedes instalar Afini desde el menú del navegador para abrirla desde
          la pantalla de inicio.
        </p>
      </div>
    </div>
  );
}
