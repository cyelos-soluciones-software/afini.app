import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SpeechSynthesisVoiceLike = SpeechSynthesisVoice;

function isBrowserSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

function getSpanishVoice(voices: SpeechSynthesisVoiceLike[]): SpeechSynthesisVoiceLike | null {
  if (!voices.length) return null;

  const preferredLangs = ["es-CO", "es-ES", "es-MX"];

  // 1) Match exact preferred locales.
  for (const lang of preferredLangs) {
    const v = voices.find((x) => x.lang?.toLowerCase() === lang.toLowerCase());
    if (v) return v;
  }

  // 2) Any Spanish voice.
  const anySpanish = voices.find((x) => x.lang?.toLowerCase().startsWith("es"));
  return anySpanish ?? null;
}

export type UseTextToSpeechResult = {
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

/**
 * Hook cliente para lectura en voz alta con Web Speech API (`window.speechSynthesis`).
 * - Sin autoplay: solo habla cuando el usuario llama `speak`.
 * - Cancela cualquier lectura previa antes de iniciar.
 * - Selecciona una voz en español (preferencia: es-CO, es-ES, es-MX).
 */
export function useTextToSpeech(): UseTextToSpeechResult {
  const isSupported = useMemo(() => isBrowserSupported(), []);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoiceLike[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const stop = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // no-op
    }
    utteranceRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return;

      const trimmed = text.trim();
      if (!trimmed) {
        stop();
        return;
      }

      // Cancel any prior audio first.
      try {
        window.speechSynthesis.cancel();
      } catch {
        // no-op
      }

      // Ensure we have the latest voices (some browsers populate async).
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) voicesRef.current = voices;

      const utterance = new window.SpeechSynthesisUtterance(trimmed);
      const chosen = getSpanishVoice(voicesRef.current);
      if (chosen) utterance.voice = chosen;

      utterance.onend = () => {
        utteranceRef.current = null;
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        // Best-effort: reset UI state on errors.
        utteranceRef.current = null;
        setIsPlaying(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      setIsPlaying(true);
      setIsPaused(false);

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        utteranceRef.current = null;
        setIsPlaying(false);
        setIsPaused(false);
      }
    },
    [isSupported, stop],
  );

  const pause = useCallback(() => {
    if (!isSupported) return;
    if (!isPlaying) return;
    if (isPaused) return;

    try {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } catch {
      // no-op
    }
  }, [isPaused, isPlaying, isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    if (!isPlaying) return;
    if (!isPaused) return;

    try {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } catch {
      // no-op
    }
  }, [isPaused, isPlaying, isSupported]);

  useEffect(() => {
    if (!isSupported) return;

    const syncVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length) voicesRef.current = voices;
      } catch {
        // no-op
      }
    };

    syncVoices();
    window.speechSynthesis.addEventListener("voiceschanged", syncVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", syncVoices);
      // Cleanup on unmount: avoid speaking after navigation.
      try {
        window.speechSynthesis.cancel();
      } catch {
        // no-op
      }
    };
  }, [isSupported]);

  return {
    isPlaying,
    isPaused,
    isSupported,
    speak,
    pause,
    resume,
    stop,
  };
}

