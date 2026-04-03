"use client";

import { useEffect } from "react";

/**
 * Registra un service worker mínimo (caché de shell + fallback offline).
 * No sustituye una PWA completa; solo mejora la recarga cuando hay red inestable.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const reg = navigator.serviceWorker.register("/sw.js");
    reg.catch(() => {
      /* ignore */
    });
  }, []);

  return null;
}
