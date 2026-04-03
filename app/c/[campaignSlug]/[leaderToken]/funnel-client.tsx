"use client";

/**
 * Experiencia del funnel ciudadano: preguntas, registro, geolocalización opcional, conclusión por streaming (Gemini).
 * @module app/c/[campaignSlug]/[leaderToken]/funnel-client
 */
import { useCompletion } from "@ai-sdk/react";
import { useState } from "react";
import PhoneInput from "react-phone-number-input";
import es from "react-phone-number-input/locale/es.json";
import { CampaignShareButtons } from "@/app/components/campaign-share-buttons";
import { LinkifyText } from "@/app/components/linkify-text";
import { requestCitizenGeolocation } from "@/lib/citizen-geolocation";
import { parseFunnelStreamError } from "@/lib/funnel-stream-error";
import { isStrictE164Format, isValidPhoneNumber } from "@/lib/phone";

export type FunnelQuestion = {
  id: string;
  questionText: string;
};

type Props = {
  campaignSlug: string;
  leaderToken: string;
  funnelUrl: string;
  citizenShareText: string;
  closingCtaText: string | null;
  campaign: {
    name: string;
    slogan: string | null;
    description: string | null;
  };
  questions: FunnelQuestion[];
};

type Step = "intro" | "questions" | "contact" | "streaming" | "done";

/**
 * Orquesta los pasos del funnel y el `useCompletion` contra `/api/funnel/stream`.
 */
export function FunnelClient({
  campaignSlug,
  leaderToken,
  funnelUrl,
  citizenShareText,
  closingCtaText,
  campaign,
  questions,
}: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [neighborhood, setNeighborhood] = useState("");
  const [votingIntention, setVotingIntention] = useState<"YES" | "NO" | "MAYBE" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phoneBlurred, setPhoneBlurred] = useState(false);
  const [isRequestingGeo, setIsRequestingGeo] = useState(false);

  const phoneAcceptable =
    !!phone && isValidPhoneNumber(phone) && isStrictE164Format(phone);
  const showPhoneFieldError =
    phoneBlurred && !!phone && !phoneAcceptable;

  const citizenFirstName = name.trim().split(/\s+/)[0] ?? "";

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

  /** Persiste la respuesta libre del ciudadano para la pregunta actual. */
  function onAnswerChange(text: string) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: text }));
  }

  /**
   * Valida intención y teléfono, pide ubicación al navegador, cambia a paso streaming y llama a `complete`.
   */
  async function runStream() {
    if (!votingIntention) {
      setError("Indica tu intención de voto.");
      return;
    }
    if (!phoneAcceptable || !phone) {
      setError("Indica un teléfono válido con código de país (solo dígitos, formato internacional).");
      return;
    }

    setError(null);
    setIsRequestingGeo(true);
    const geo = await requestCitizenGeolocation();
    setIsRequestingGeo(false);

    setStep("streaming");
    setCompletion("");

    const voterPayload = {
      name: name.trim(),
      phone,
      neighborhood: neighborhood.trim(),
      votingIntention,
      ...(geo ? { latitude: geo.latitude, longitude: geo.longitude } : {}),
    };

    await complete("", {
      body: {
        voter: voterPayload,
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
          <p className="text-[11px] leading-relaxed text-[var(--muted)]">
            Al pulsar «Ver conclusión», el navegador puede mostrarte un permiso para compartir tu ubicación
            aproximada (coordenadas). Es opcional: si lo rechazas, el registro continúa igual y solo no guardamos
            latitud y longitud.
          </p>
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
            <label className="text-xs font-medium text-[var(--muted)]" htmlFor="funnel-phone">
              Teléfono (con código de país)
            </label>
            <div className="funnel-phone-input rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1">
              <PhoneInput
                id="funnel-phone"
                international
                defaultCountry="CO"
                labels={es}
                value={phone}
                onChange={setPhone}
                onBlur={() => setPhoneBlurred(true)}
                placeholder="Escribe tu número aquí"
                aria-invalid={showPhoneFieldError}
                aria-describedby="funnel-phone-hint"
                className="w-full"
              />
            </div>
            {showPhoneFieldError ? (
              <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                Revisa el número: debe ser válido para el país elegido y en formato internacional (+…).
              </p>
            ) : null}
            <p id="funnel-phone-hint" className="text-[11px] text-[var(--muted)]">
              Elige el país a la izquierda y escribe el número en el campo de la derecha. No podrás repetir el
              registro en esta campaña con el mismo número.
            </p>
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
                isLoading ||
                isRequestingGeo ||
                !name.trim() ||
                !phoneAcceptable ||
                !neighborhood.trim() ||
                !votingIntention
              }
              onClick={() => void runStream()}
              className="flex-1 rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-50"
            >
              {isRequestingGeo ? "Ubicación…" : "Ver conclusión"}
            </button>
          </div>
        </section>
      )}

      {step === "streaming" && (
        <section className="space-y-4" aria-busy={isLoading} aria-live="polite">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Generando tu conclusión</h2>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            {citizenFirstName ? (
              <>
                <span className="font-medium text-[var(--foreground)]">{citizenFirstName}</span>, gracias por
                esperar. Estamos preparando una respuesta pensada para ti; puede tardar unos segundos.
              </>
            ) : (
              <>Gracias por esperar. Estamos preparando tu respuesta; puede tardar unos segundos.</>
            )}
          </p>
          {isLoading ? (
            <div className="space-y-3" role="status">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 shrink-0 rounded-full border-2 border-[var(--border)] border-t-[var(--primary)] animate-spin"
                  aria-hidden
                />
                <p className="text-xs text-[var(--muted)]">Procesando con la campaña…</p>
              </div>
              <div className="funnel-stream-bar-track" aria-hidden>
                <div className="funnel-stream-bar-fill" />
              </div>
            </div>
          ) : null}
          <div className="min-h-[120px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
            {completion ? (
              completion
            ) : isLoading ? (
              <p className="text-[var(--muted)]">Aquí verás el texto en cuanto empiece a llegar…</p>
            ) : (
              "…"
            )}
          </div>
        </section>
      )}

      {step === "done" && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Gracias por participar</h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
            {completion}
          </div>

          {closingCtaText?.trim() ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Más sobre la campaña</h3>
              <div className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                <LinkifyText text={closingCtaText.trim()} />
              </div>
            </div>
          ) : null}

          <p className="text-sm text-[var(--muted)]">Tu registro quedó asociado a esta campaña.</p>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Invita a más personas</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Comparte esta misma página para que otros participen con el mismo enlace.
            </p>
            <div className="mt-2 break-all rounded-lg bg-[var(--background)] px-2 py-1.5 font-mono text-[10px] text-[var(--foreground)] sm:text-xs">
              {funnelUrl}
            </div>
            <div className="mt-3">
              <CampaignShareButtons funnelUrl={funnelUrl} shareText={citizenShareText} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
