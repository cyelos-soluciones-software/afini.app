import Link from "next/link";
import type { ParticipantResponseRow } from "@/lib/participant-responses-types";

type QuestionCol = { id: string; questionText: string };

function formatAffinity(a: number | null): string {
  if (a == null) return "—";
  return `${(a * 100).toFixed(1)}%`;
}

function formatGeo(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return "—";
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function ParticipantResponsesTable({
  campaignId,
  campaignName,
  questions,
  data,
}: {
  campaignId: string;
  campaignName: string;
  questions: QuestionCol[];
  data: {
    rows: ParticipantResponseRow[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}) {
  const { rows, total, page, pageSize, totalPages } = data;
  const exportHref = `/api/campaigns/${campaignId}/responses/export`;

  const buildPageLink = (p: number) =>
    `/dashboard/campaign-admin/${campaignId}/respuestas${p <= 1 ? "" : `?page=${p}`}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-[var(--foreground)]">Respuestas de participantes</h2>
          <p className="mt-1 max-w-3xl text-sm text-[var(--muted)]">
            Textos libres y clasificación IA del funnel.{" "}
            <strong className="font-medium text-[var(--foreground)]">
              No se muestran nombre, teléfono ni datos de contacto.
            </strong>{" "}
            La referencia corta correlaciona con el Excel; la zona es autorreportada. Las coordenadas son opcionales
            (navegador, si el ciudadano autorizó).
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <a
            href={exportHref}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
          >
            Descargar Excel (.xlsx)
          </a>
          <p className="text-xs text-[var(--muted)]">Exporta todos los registros por lotes (puede tardar si el volumen es alto).</p>
        </div>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Campaña: <span className="font-medium text-[var(--foreground)]">{campaignName}</span> · Total registros:{" "}
        <span className="font-medium text-[var(--foreground)]">{total}</span>
        {total > 0 ? (
          <>
            {" "}
            · Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
          </>
        ) : null}
      </p>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
          Aún no hay participantes con respuestas guardadas en esta campaña.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                <th className="sticky left-0 z-10 whitespace-nowrap bg-[var(--surface)] px-3 py-2 font-medium">Ref.</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium">Fecha</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium">Intención</th>
                <th className="min-w-[120px] px-3 py-2 font-medium">Zona</th>
                <th className="min-w-[130px] px-3 py-2 font-medium">Lat / lon</th>
                <th className="min-w-[140px] px-3 py-2 font-medium">Canal / líder</th>
                <th className="min-w-[280px] px-3 py-2 font-medium">Preguntas y respuestas</th>
                <th className="min-w-[200px] px-3 py-2 font-medium">Conclusión IA</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium">Sentimiento</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium">Afinidad IA</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="sticky left-0 bg-[var(--background)] px-3 py-3 font-mono text-xs text-[var(--muted)]">
                    {row.refId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-[var(--muted)]">
                    {row.submittedAt.toLocaleString("es", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{row.votingIntentionLabel}</td>
                  <td className="px-3 py-3 text-[var(--foreground)]">{row.neighborhood}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-[var(--muted)]">
                    {formatGeo(row.latitude, row.longitude)}
                  </td>
                  <td className="px-3 py-3 text-[var(--foreground)]">{row.leaderLabel}</td>
                  <td className="px-3 py-3">
                    <div className="space-y-3">
                      {questions.length > 0
                        ? questions.map((q) => {
                            const pair = row.qaPairs.find((p) => p.questionId === q.id);
                            return (
                              <div key={q.id} className="rounded-lg border border-[var(--border)]/80 bg-[var(--surface)]/50 p-2">
                                <p className="text-xs font-medium text-[var(--primary)]">{q.questionText}</p>
                                <p className="mt-1 whitespace-pre-wrap text-[var(--foreground)]">{pair?.answer ?? "—"}</p>
                              </div>
                            );
                          })
                        : row.qaPairs.map((p) => (
                            <div key={p.questionId} className="rounded-lg border border-[var(--border)]/80 bg-[var(--surface)]/50 p-2">
                              <p className="text-xs font-medium text-[var(--muted)]">{p.questionText}</p>
                              <p className="mt-1 whitespace-pre-wrap text-[var(--foreground)]">{p.answer}</p>
                            </div>
                          ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-pre-wrap text-[var(--muted)]">
                    {row.conclusion ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{row.sentimentLabel ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3">{formatAffinity(row.affinityScore)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4 text-sm">
          <p className="text-[var(--muted)]">
            Página {page} de {totalPages}
          </p>
          <div className="flex flex-wrap gap-2">
            {page > 1 ? (
              <Link
                href={buildPageLink(page - 1)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 font-medium hover:bg-[var(--border)]/40"
              >
                ← Anterior
              </Link>
            ) : (
              <span className="rounded-lg px-3 py-1.5 text-[var(--muted)]">← Anterior</span>
            )}
            {page < totalPages ? (
              <Link
                href={buildPageLink(page + 1)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 font-medium hover:bg-[var(--border)]/40"
              >
                Siguiente →
              </Link>
            ) : (
              <span className="rounded-lg px-3 py-1.5 text-[var(--muted)]">Siguiente →</span>
            )}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
