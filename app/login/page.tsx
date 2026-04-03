import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/login/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user) {
    redirect(params.callbackUrl && params.callbackUrl.startsWith("/") ? params.callbackUrl : "/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[var(--foreground)]">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Eco · Cyelos — gestión de campañas</p>
        </div>
        <LoginForm callbackUrl={params.callbackUrl} />
      </div>
    </div>
  );
}
