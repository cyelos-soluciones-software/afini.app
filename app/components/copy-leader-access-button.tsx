"use client";

import { useState } from "react";
import { buildLeaderInviteCopy } from "@/lib/leader-invite";

type Props = {
  leaderEmail: string;
};

/**
 * Copia el mensaje de invitación; pide la clave temporal (no almacenada en servidor).
 */
export function CopyLeaderAccessButton({ leaderEmail }: Props) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function copy() {
    if (!password.trim()) {
      setFeedback("Escribe la clave temporal que asignaste al crear este líder.");
      return;
    }
    const text = buildLeaderInviteCopy(leaderEmail, password.trim());
    try {
      await navigator.clipboard.writeText(text);
      setFeedback("Copiado al portapapeles.");
      setOpen(false);
      setPassword("");
    } catch {
      setFeedback("No se pudo copiar. Copia el texto manualmente.");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setFeedback(null);
        }}
        className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--primary)] hover:bg-[var(--border)]/30"
      >
        Copiar acceso
      </button>
      {open ? (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 shadow-lg">
          <p className="text-xs text-[var(--muted)]">
            Introduce la clave temporal que diste de alta para este líder (no la guardamos).
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Clave temporal"
            className="mt-2 w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => void copy()}
              className="flex-1 rounded-lg bg-[var(--primary)] py-1.5 text-xs font-medium text-[var(--primary-foreground)]"
            >
              Copiar mensaje
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-[var(--border)] px-2 text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
      {feedback ? <p className="mt-1 text-[10px] text-[var(--muted)]">{feedback}</p> : null}
    </div>
  );
}
