"use client";

import type { CampaignAnalytics } from "@/app/actions/campaign-manager";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#0891b2", "#22d3ee", "#64748b", "#94a3b8", "#0e7490", "#155e75"];

type LeaderRow = CampaignAnalytics["byLeader"][number];

function LeaderTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: LeaderRow }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-[var(--foreground)]">{row.name}</p>
      <p className="text-[var(--muted)]">
        {row.count} votante{row.count === 1 ? "" : "s"} · {row.sharePct}% del total
      </p>
    </div>
  );
}

export function CampaignCharts({ data }: { data: CampaignAnalytics }) {
  const { totals } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Votantes</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{totals.voters}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Interacciones (funnel)</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{totals.interactions}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Con sentimiento IA</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{totals.withSentiment}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Pendiente clasificación IA</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{totals.pendingSentiment}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="mb-1 text-sm font-medium text-[var(--foreground)]">Intención de voto</h3>
          <p className="mb-4 text-xs text-[var(--muted)]">Declarada por el ciudadano al cerrar el funnel (Voter.votingIntention).</p>
          <div className="h-64">
            {data.intention.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.intention} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {data.intention.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[var(--muted)]">Sin datos de votantes.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="mb-1 text-sm font-medium text-[var(--foreground)]">Efectividad por líder</h3>
          <p className="mb-4 text-xs text-[var(--muted)]">
            Votantes captados por enlace de cada líder (conteo por líder y % sobre el total de la campaña).
          </p>
          <div className="h-64">
            {data.byLeader.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byLeader} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip content={<LeaderTooltip />} />
                  <Bar dataKey="count" fill="#0891b2" radius={[0, 4, 4, 0]} name="Votantes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[var(--muted)]">Sin líderes o sin votantes.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 lg:col-span-2">
          <h3 className="mb-1 text-sm font-medium text-[var(--foreground)]">Votantes por barrio (top 12)</h3>
          <p className="mb-4 text-xs text-[var(--muted)]">Agrupación por texto de barrio/zona indicado en el funnel.</p>
          <div className="h-72">
            {data.byNeighborhood.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byNeighborhood}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Votantes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[var(--muted)]">Sin datos.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="mb-1 text-sm font-medium text-[var(--foreground)]">Sentimiento (IA)</h3>
          <p className="mb-4 text-xs text-[var(--muted)]">
            Clasificación tras el funnel (Interaction.sentiment). “Pendiente” = interacción sin clasificación.
          </p>
          <div className="h-64">
            {data.sentiment.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.sentiment} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {data.sentiment.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[var(--muted)]">Sin interacciones.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="mb-1 text-sm font-medium text-[var(--foreground)]">Afinidad media (IA)</h3>
          <p className="mb-4 text-xs text-[var(--muted)]">Promedio de affinityScore en interacciones donde existe puntuación.</p>
          <p className="text-3xl font-semibold text-[var(--primary)]">
            {data.affinityAvg != null ? `${(data.affinityAvg * 100).toFixed(1)}%` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
