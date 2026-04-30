"use client";

import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useCallback } from "react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

type Props = {
  text: string;
  className?: string;
};

export function TextToSpeechButton({ text, className }: Props) {
  const { isSupported, isPlaying, isPaused, speak, pause, resume, stop } =
    useTextToSpeech();

  const onClick = useCallback(() => {
    if (!isPlaying) {
      speak(text);
      return;
    }
    if (isPaused) {
      resume();
      return;
    }
    pause();
  }, [isPaused, isPlaying, pause, resume, speak, text]);

  const onStop = useCallback(() => stop(), [stop]);

  if (!isSupported) return null;

  const isActive = isPlaying && !isPaused;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <button
        type="button"
        onClick={onClick}
        className={[
          "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
          "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)]/40",
          isActive ? "animate-pulse border-[var(--primary)]/40" : "",
        ].join(" ")}
      >
        {!isPlaying ? (
          <>
            <Volume2 className="h-4 w-4" />
            Escuchar tu resultado
          </>
        ) : isPaused ? (
          <>
            <Play className="h-4 w-4" />
            Continuar
          </>
        ) : (
          <>
            <Pause className="h-4 w-4" />
            Pausar
          </>
        )}
      </button>

      {isPlaying ? (
        <button
          type="button"
          onClick={onStop}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--border)]/40"
        >
          <Square className="h-4 w-4" />
          Detener
        </button>
      ) : null}
    </div>
  );
}

