"use client";

import { useState } from "react";

type Props = {
  /** Identificador de campaña (referencia en mensajes a ventas). */
  campaignId?: string;
  campaignName?: string;
};

function buildMailtoSubject(name?: string, id?: string) {
  const base = "Upgrade Premium Afini";
  if (name && id) return `${base} — ${name} (${id})`;
  if (name) return `${base} — ${name}`;
  return base;
}

function buildWaText(name?: string, id?: string) {
  let t =
    "Hola, me interesa ampliar límites con el plan Premium de Afini. La negociación es por campaña.";
  if (name) t += ` Campaña: ${name}.`;
  if (id) t += ` ID: ${id}.`;
  return t;
}

export function UpgradePremiumCta({ campaignId, campaignName }: Props) {
  const [open, setOpen] = useState(false);
  const mailSubject = encodeURIComponent(buildMailtoSubject(campaignName, campaignId));
  const waHref = `https://wa.me/573045778139?text=${encodeURIComponent(buildWaText(campaignName, campaignId))}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
      >
        Haz Upgrade a Premium
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-title"
        >
          <div className="max-w-md rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl">
            <h2 id="upgrade-title" className="text-lg font-semibold text-[var(--foreground)]">
              Pásate a Premium
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Amplía líderes, ciudadanos y funciones en la campaña que elijas. Cada campaña se cotiza por separado con
              ventas. Escríbenos por correo o por WhatsApp (Cyelos).
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:oscar.bernal@cyelos.com?subject=${mailSubject}`}
                className="inline-flex flex-1 min-w-[140px] items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
              >
                Escribir a ventas
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 min-w-[140px] items-center justify-center rounded-lg border border-[#25D366] bg-[#25D366]/10 px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[#25D366]/20"
              >
                WhatsApp Cyelos
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] sm:w-auto"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
