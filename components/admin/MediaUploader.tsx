"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, Loader2, FileCheck2 } from "lucide-react";
import { getCloudinaryUploadSignature } from "@/lib/actions/admin/cloudinary";

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const { cloudName, apiKey, timestamp, signature } =
    await getCloudinaryUploadSignature(folder);

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("signature", signature);
  body.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: "POST", body }
  );

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.error?.message ?? "Байршуулалт амжилтгүй боллоо.");
  }

  const data = await res.json();
  return data.secure_url as string;
}

export function MediaUploader({
  fieldName,
  label,
  accept,
  folder,
  initialUrl,
}: {
  fieldName: string;
  label: string;
  accept: string;
  folder: string;
  initialUrl?: string | null;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setError(null);
    try {
      const uploadedUrl = await uploadToCloudinary(file, folder);
      setUrl(uploadedUrl);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Байршуулалт амжилтгүй боллоо.");
    }
  }

  const isImage = accept.startsWith("image/");

  return (
    <div>
      <input type="hidden" name={fieldName} value={url} />
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>

      {isImage && url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="mb-2 h-20 w-32 rounded-lg border border-slate-200 object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading"}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {status === "uploading" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <UploadCloud size={15} />
          )}
          {status === "uploading" ? "Байршуулж байна..." : url ? "Солих" : "Файл сонгох"}
        </button>

        {url && status !== "uploading" && (
          <>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-brand-600"
            >
              <FileCheck2 size={15} /> Харах
            </a>
            <button
              type="button"
              onClick={() => setUrl("")}
              className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-red-500"
            >
              <X size={15} /> Хасах
            </button>
          </>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
