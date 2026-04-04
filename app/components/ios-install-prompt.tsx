"use client";

import { useEffect, useState } from "react";

export function IosInstallPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      const ua = window.navigator.userAgent;
      const iOS = /iPad|iPhone|iPod/.test(ua);
      const webkit = /WebKit/.test(ua);
      const notOther = !/CriOS|FxiOS|EdgiOS|OPiOS|mercury/i.test(ua);
      const standalone =
        "standalone" in window.navigator &&
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const displayStandalone = window.matchMedia("(display-mode: standalone)").matches;
      if (iOS && webkit && notOther && !standalone && !displayStandalone) {
        setOpen(true);
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  if (!open) return null;

  return (
    <div
      role="status"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-4 z-[60] mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)]/98 p-4 text-sm shadow-[0_12px_40px_var(--brand-glow)] backdrop-blur-md md:left-auto md:right-4 md:max-w-sm"
    >
      <p className="font-display font-semibold text-[var(--foreground)]">Usar Afini como app en el iPhone</p>
      <p className="mt-2 text-[var(--muted)]">
        En <strong className="text-[var(--foreground)]">Safari</strong>, toca el botón{" "}
        <strong className="text-[var(--foreground)]">Compartir</strong> y elige{" "}
        <strong className="text-[var(--foreground)]">Añadir a inicio</strong>. Así tendrás el panel a un toque, igual que
        una app de la tienda.
      </p>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-3 min-h-[44px] text-sm font-semibold text-[var(--primary)] hover:underline"
      >
        Entendido
      </button>
    </div>
  );
}
