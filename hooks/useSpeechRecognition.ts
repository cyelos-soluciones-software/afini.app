import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Tipos mínimos para Web Speech API.
 * En algunos entornos TypeScript/Next, `lib.dom.d.ts` no expone `SpeechRecognition*`.
 */
type SpeechRecognitionErrorCode =
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported";

type SpeechRecognitionErrorEvent = Event & {
  error: SpeechRecognitionErrorCode;
  message?: string;
};

type SpeechRecognitionAlternative = {
  transcript: string;
  confidence?: number;
};

type SpeechRecognitionResult = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
};

type SpeechRecognitionResultList = {
  length: number;
  item?: (index: number) => SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognition;

type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as SpeechRecognitionWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function parseSpeechRecognitionError(event: SpeechRecognitionErrorEvent): string {
  switch (event.error) {
    case "not-allowed":
    case "service-not-allowed":
      return "No se pudo acceder al micrófono. Revisa los permisos del navegador.";
    case "audio-capture":
      return "No se detectó un micrófono disponible.";
    case "network":
      return "Error de red durante el dictado por voz.";
    case "aborted":
      return "El dictado por voz fue interrumpido.";
    case "no-speech":
      return "No se detectó voz. Intenta hablar más cerca del micrófono.";
    default:
      return "Ocurrió un error con el dictado por voz.";
  }
}

function normalizeTranscript(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export type UseSpeechRecognitionResult = {
  supported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
  clearError: () => void;
};

/**
 * Hook cliente para dictado por voz usando Web Speech API (SpeechRecognition / webkitSpeechRecognition).
 * Configurado para español (Colombia) con resultados interinos y reconocimiento continuo.
 */
export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const recognitionCtor = useMemo(() => getSpeechRecognitionCtor(), []);
  const supported = recognitionCtor !== null;

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    } catch {
      // no-op: algunos navegadores lanzan si se detiene fuera de estado válido
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const startListening = useCallback(() => {
    if (!recognitionCtor) return;

    clearError();
    clearTranscript();

    const recognition = new recognitionCtor();
    recognition.lang = "es-CO";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      // Algunos navegadores (notablemente Chrome Android) repiten resultados previos.
      // Para evitar duplicaciones, reconstruimos el texto completo en cada evento.
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (!text) continue;
        if (result.isFinal) finalText += text;
        else interimText += text;
      }
      setTranscript(normalizeTranscript(`${finalText} ${interimText}`));
    };

    recognition.onerror = (ev) => {
      setError(parseSpeechRecognitionError(ev));
      stopListening();
    };

    recognition.onend = () => {
      // En Chrome/Safari, aun con continuous puede terminar por silencio.
      // Si el usuario no pidió detener, intentamos reanudar.
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Si falla, dejamos de escuchar para evitar loops.
          isListeningRef.current = false;
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;
    isListeningRef.current = true;
    setIsListening(true);

    try {
      recognition.start();
    } catch {
      setError("No se pudo iniciar el dictado por voz.");
      stopListening();
    }
  }, [clearError, clearTranscript, recognitionCtor, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    supported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    clearTranscript,
    clearError,
  };
}

