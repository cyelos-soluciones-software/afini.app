"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const displayStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
  const navStandalone =
    "standalone" in window.navigator && (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return displayStandalone || navStandalone;
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (hidden || !deferred) return null;

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[60] flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/98 p-3 shadow-[0_12px_40px_var(--brand-glow)] backdrop-blur-md">
      <button
        type="button"
        onClick={async () => {
          try {
            await deferred.prompt();
            const choice = await deferred.userChoice;
            if (choice.outcome === "accepted") setHidden(true);
            setDeferred(null);
          } catch {
            setHidden(true);
          }
        }}
        className="min-h-[44px] rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:brightness-105"
      >
        Instalar app
      </button>
      <button
        type="button"
        onClick={() => setHidden(true)}
        className="min-h-[44px] rounded-xl px-3 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--border)]/60 hover:text-[var(--foreground)]"
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>
  );
}

