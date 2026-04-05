"use client";

/**
 * Widget explícito de Cloudflare Turnstile (requiere script cargado con `?render=explicit`).
 */
import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type Props = {
  siteKey: string;
  /** Cuando el script de Turnstile ya cargó y `window.turnstile` existe. */
  apiReady: boolean;
  onToken: (token: string | null) => void;
};

export function TurnstileField({ siteKey, apiReady, onToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const teardown = useCallback(() => {
    if (widgetIdRef.current && typeof window !== "undefined" && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        /* ignore */
      }
      widgetIdRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
  }, []);

  const mount = useCallback(() => {
    if (!apiReady || typeof window === "undefined" || !window.turnstile || !containerRef.current) {
      return;
    }
    teardown();
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
      theme: "auto",
    });
  }, [apiReady, siteKey, onToken, teardown]);

  useEffect(() => {
    mount();
    return () => {
      teardown();
    };
  }, [mount, teardown]);

  return <div ref={containerRef} className="flex min-h-[65px] justify-center py-1" />;
}
