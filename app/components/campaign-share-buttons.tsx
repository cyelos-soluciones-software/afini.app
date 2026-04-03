"use client";

import { useCallback, useState } from "react";
import {
  facebookShareHref,
  telegramShareHref,
  threadsShareHref,
  whatsappShareHref,
  xShareHref,
} from "@/lib/social-share";

type Props = {
  funnelUrl: string;
  shareText: string;
};

const btnBase =
  "inline-flex min-h-[40px] items-center justify-center rounded-lg px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:opacity-95 sm:min-h-[42px] sm:px-4 sm:text-sm";

export function CampaignShareButtons({ funnelUrl, shareText }: Props) {
  const [copyHint, setCopyHint] = useState<string | null>(null);

  /** Instagram/TikTok: en móvil intenta el menú nativo del sistema; si no, copia la URL. */
  const shareOrFallbackCopy = useCallback(
    async (app: "Instagram" | "TikTok") => {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        try {
          await navigator.share({ text: shareText, url: funnelUrl });
          return;
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.writeText(funnelUrl);
        setCopyHint(
          app === "Instagram"
            ? "Enlace copiado. En Instagram, pégalo en tu historia, biografía o mensaje directo."
            : "Enlace copiado. En TikTok, pégalo en tu perfil, comentario o descripción del video.",
        );
        window.setTimeout(() => setCopyHint(null), 5000);
      } catch {
        setCopyHint("No se pudo copiar automáticamente. Selecciona y copia el enlace de arriba.");
        window.setTimeout(() => setCopyHint(null), 5000);
      }
    },
    [funnelUrl, shareText],
  );

  return (
    <div className="space-y-3">
      {copyHint ? (
        <p className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3 py-2 text-xs text-[var(--foreground)]" role="status">
          {copyHint}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <a
          href={whatsappShareHref(shareText)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-[#25D366]`}
        >
          WhatsApp
        </a>
        <a
          href={telegramShareHref(funnelUrl, shareText)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-[#0088cc]`}
        >
          Telegram
        </a>
        <a
          href={facebookShareHref(funnelUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-[#1877F2]`}
        >
          Facebook
        </a>
        <a
          href={xShareHref(shareText)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-black ring-1 ring-white/25`}
        >
          X
        </a>
        <a
          href={threadsShareHref(shareText)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-black ring-1 ring-white/25`}
        >
          Threads
        </a>
        <button
          type="button"
          onClick={() => void shareOrFallbackCopy("Instagram")}
          className={`${btnBase} bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888]`}
        >
          Instagram
        </button>
        <button
          type="button"
          onClick={() => void shareOrFallbackCopy("TikTok")}
          className={`${btnBase} bg-[#010101] ring-1 ring-[#fe2c55]/60`}
        >
          TikTok
        </button>
      </div>

      <p className="text-[11px] leading-relaxed text-[var(--muted)]">
        WhatsApp, Telegram, Facebook, X y Threads abren la app o la web del servicio.         En móvil, Instagram y TikTok pueden abrir el menú de compartir del sistema; si no, se copia el enlace para que lo
        pegues en la app.
      </p>
    </div>
  );
}
