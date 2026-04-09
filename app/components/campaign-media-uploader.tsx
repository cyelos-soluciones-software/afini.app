"use client";

import { useMemo, useState } from "react";

type Kind = "banner" | "photo";

type Props = {
  campaignId: string;
  kind: Kind;
  label: string;
  hint: string;
  currentUrl: string | null;
  /** Nombre del campo hidden que se enviará en el FormData. */
  fieldName: string;
};

const accept = "image/png,image/jpeg,image/webp";

async function presignUpload(input: { campaignId: string; kind: Kind; contentType: string; size: number }) {
  const res = await fetch("/api/uploads/r2", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => null)) as
    | { uploadUrl: string; publicUrl: string }
    | { error: string }
    | null;
  if (!res.ok || !data || !("uploadUrl" in data)) {
    throw new Error((data as { error?: string } | null)?.error ?? "No se pudo iniciar la carga.");
  }
  return data;
}

async function putFile(url: string, file: File) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "content-type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("No se pudo subir el archivo.");
}

export function CampaignMediaUploader({ campaignId, kind, label, hint, currentUrl, fieldName }: Props) {
  const [uploading, setUploading] = useState(false);
  const [value, setValue] = useState<string>(currentUrl ?? "");
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => (value?.trim() ? value.trim() : null), [value]);

  async function onPick(file: File | null) {
    setError(null);
    if (!file) return;
    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await presignUpload({
        campaignId,
        kind,
        contentType: file.type,
        size: file.size,
      });
      await putFile(uploadUrl, file);
      setValue(publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir archivo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
          <p className="text-xs text-[var(--muted)]">{hint}</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm hover:bg-[var(--border)]/40">
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={uploading}
            onChange={(e) => void onPick(e.target.files?.[0] ?? null)}
          />
          {uploading ? "Subiendo…" : "Subir imagen"}
        </label>
      </div>

      {preview ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {kind === "banner" ? (
            <img src={preview} alt={label} className="h-[140px] w-full object-cover sm:h-[180px]" />
          ) : (
            <div className="flex items-center gap-4 p-4">
              <img src={preview} alt={label} className="h-16 w-16 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted)]">Vista previa</p>
                <p className="truncate text-sm text-[var(--foreground)]">{preview}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-[var(--muted)]">No hay imagen cargada (opcional).</p>
      )}

      <input type="hidden" name={fieldName} value={value} />
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

