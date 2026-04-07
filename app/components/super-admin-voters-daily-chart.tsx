"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { VoterDayPoint } from "@/lib/super-admin-metrics";

function formatDayLabel(isoDay: string) {
  const [y, m, d] = isoDay.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

export function SuperAdminVotersDailyChart({ data }: { data: VoterDayPoint[] }) {
  const chartData = data.map((p) => ({
    ...p,
    label: formatDayLabel(p.day),
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 text-sm text-[var(--muted)]">
        No hay datos de ciudadanos en este período.
      </div>
    );
  }

  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]/80" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted)" }} width={40} />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
            formatter={(value) => [typeof value === "number" ? value : 0, "Ciudadanos nuevos"]}
            labelFormatter={(label) => String(label)}
          />
          <Bar dataKey="count" name="Ciudadanos" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
