"use client";

import { useCompletion } from "@ai-sdk/react";
import { useState } from "react";
import { parseFunnelStreamError } from "@/lib/funnel-stream-error";

export type FunnelQuestion = {
  id: string;
  questionText: string;
};

type Props = {
  campaignSlug: string;
  leaderToken: string;
  campaign: {
    name: string;
    slogan: string | null;
    description: string | null;
  };
  questions: FunnelQuestion[];
};

type Step = "intro" | "questions" | "contact" | "streaming" | "done";

export function FunnelClient({ campaignSlug, leaderToken, campaign, questions }: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [votingIntention, setVotingIntention] = useState<"YES" | "NO" | "MAYBE" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { completion, complete, isLoading, setCompletion } = useCompletion({
    api: "/api/funnel/stream",
    streamProtocol: "text",
    body: { campaignSlug, leaderToken },
    onFinish: (_prompt, text) => {
      const full = text.trim();
      if (!full) {
        setError(
          "Gemini devolvió texto vacío. Revisa la clave en .env, cuotas y la consola donde corre `npm run dev`.",
        );
        setStep("contact");
        return;
      }
      setStep("done");
    },
    onError: (err) => {
      setError(parseFunnelStreamError(err));
      setStep("contact");
    },
  });

  const currentQuestion = questions[qIndex];
  const progress =
    step === "intro"
      ? 5
      : step === "questions" && questions.length
        ? Math.min(95, Math.round(((qIndex + 1) / questions.length) * 70) + 5)
        : step === "contact"
          ? 85
          : 100;

  const canNext =
    currentQuestion && (answers[currentQuestion.id]?.trim().length ?? 0) > 0;

  function onAnswerChange(text: string) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: text }));
  }

  async function runStream() {
    if (!votingIntention) {
      setError("Indica tu intención de voto.");
      return;
    }
    setError(null);
    setStep("streaming");
    setCompletion("");

    await complete("", {
      body: {
        voter: {
          name: name.trim(),
          phone: phone.trim(),
          neighborhood: neighborhood.trim(),
          votingIntention,
        },
        answers: questions.map((q) => ({
          questionId: q.id,
          answer: answers[q.id]?.trim() ?? "",
        })),
      },
    });
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-4 pb-10 pt-6">
      <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full bg-[var(--primary)] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {step === "intro" && (
        <section className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--primary)]">Conversación</p>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">{campaign.name}</h1>
          {campaign.slogan ? <p className="text-lg text-[var(--muted)]">{campaign.slogan}</p> : null}
          {campaign.description ? (
            <p className="text-sm leading-relaxed text-[var(--muted)]">{campaign.description}</p>
          ) : null}
          <p className="text-sm text-[var(--foreground)]">
            Te haremos {questions.length} pregunta{questions.length === 1 ? "" : "s"} en lenguaje natural. Luego
            podrás dejarnos tus datos de contacto.
          </p>
          <button
            type="button"
            onClick={() => setStep("questions")}
            className="w-full rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
          >
            Comenzar
          </button>
        </section>
      )}

      {step === "questions" && currentQuestion && (
        <section className="flex flex-1 flex-col gap-4">
          <div className="rounded-2xl rounded-tl-md border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-[var(--foreground)]">{currentQuestion.questionText}</p>
          </div>
          <label className="text-xs font-medium text-[var(--muted)]">Tu respuesta</label>
          <textarea
            value={answers[currentQuestion.id] ?? ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            rows={5}
            placeholder="Escribe con tus palabras…"
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none ring-[var(--primary)] focus:ring-2"
          />
          <div className="mt-auto flex gap-2 pt-4">
            {qIndex > 0 ? (
              <button
                type="button"
                onClick={() => setQIndex((i) => i - 1)}
                className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]/40"
              >
                Atrás
              </button>
            ) : null}
            <button
              type="button"
              disabled={!canNext}
              onClick={() => {
                if (qIndex < questions.length - 1) setQIndex((i) => i + 1);
                else setStep("contact");
              }}
              className="flex-1 rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-50"
            >
              {qIndex < questions.length - 1 ? "Siguiente" : "Continuar"}
            </button>
          </div>
        </section>
      )}

      {step === "contact" && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Tus datos</h2>
          <p className="text-sm text-[var(--muted)]">Para poder ubicar tu apoyo en la campaña.</p>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--muted)]">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--primary)] focus:ring-2"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--muted)]">Teléfono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              inputMode="tel"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--primary)] focus:ring-2"
              autoComplete="tel"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--muted)]">Barrio o zona</label>
            <input
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none ring-[var(--primary)] focus:ring-2"
              autoComplete="address-line2"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--muted)]">¿Intención de voto?</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["YES", "Sí"],
                  ["NO", "No"],
                  ["MAYBE", "Tal vez"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  aria-pressed={votingIntention === val}
                  onClick={() => setVotingIntention(val)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    votingIntention === val
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]/40"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep("questions")}
              className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]/40"
            >
              Atrás
            </button>
            <button
              type="button"
              disabled={
                isLoading || !name.trim() || !phone.trim() || !neighborhood.trim() || !votingIntention
              }
              onClick={() => void runStream()}
              className="flex-1 rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-50"
            >
              Ver conclusión
            </button>
          </div>
        </section>
      )}

      {step === "streaming" && (
        <section className="space-y-4">
          <p className="text-sm font-medium text-[var(--muted)]">Generando tu conclusión…</p>
          <div className="min-h-[120px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
            {completion || "…"}
          </div>
        </section>
      )}

      {step === "done" && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Gracias por participar</h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
            {completion}
          </div>
          <p className="text-sm text-[var(--muted)]">Tu registro quedó asociado a esta campaña.</p>
        </section>
      )}
    </div>
  );
}
