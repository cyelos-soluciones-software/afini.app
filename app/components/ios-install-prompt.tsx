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
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm shadow-lg md:left-auto md:right-4 md:max-w-sm"
    >
      <p className="font-medium text-[var(--foreground)]">Instalar en iPhone</p>
      <p className="mt-2 text-[var(--muted)]">
        En Safari, toca <strong className="text-[var(--foreground)]">Compartir</strong> y luego{" "}
        <strong className="text-[var(--foreground)]">Añadir a inicio</strong> para tener el acceso como app.
      </p>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-3 text-sm font-medium text-[var(--primary)] hover:underline"
      >
        Entendido
      </button>
    </div>
  );
}
