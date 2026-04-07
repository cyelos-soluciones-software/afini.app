"use client";

import { useState } from "react";

type Props = {
  currentKey: string;
  fromStr?: string;
  toStr?: string;
};

/**
 * Filtro GET hacia `/dashboard` para el período de métricas (súper admin y admin de campaña).
 */
export function SuperAdminMetricsFilters({ currentKey, fromStr, toStr }: Props) {
  const [range, setRange] = useState(currentKey);

  return (
    <form method="get" action="/dashboard" className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[200px] flex-1 space-y-1.5">
        <label htmlFor="metrics-range" className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Período
        </label>
        <select
          id="metrics-range"
          name="range"
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25"
        >
          <option value="30d">Últimos 30 días</option>
          <option value="1m">1 mes (30 días)</option>
          <option value="2m">2 meses (60 días)</option>
          <option value="3m">3 meses (90 días)</option>
          <option value="custom">Personalizado</option>
        </select>
      </div>
      {range === "custom" ? (
        <div className="flex flex-wrap gap-3">
          <div className="space-y-1.5">
            <label htmlFor="metrics-from" className="text-xs font-medium text-[var(--muted)]">
              Desde
            </label>
            <input
              id="metrics-from"
              name="from"
              type="date"
              defaultValue={fromStr ?? ""}
              required={range === "custom"}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="metrics-to" className="text-xs font-medium text-[var(--muted)]">
              Hasta
            </label>
            <input
              id="metrics-to"
              name="to"
              type="date"
              defaultValue={toStr ?? ""}
              required={range === "custom"}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25"
            />
          </div>
        </div>
      ) : null}
      <button
        type="submit"
        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-95"
      >
        Aplicar
      </button>
    </form>
  );
}
