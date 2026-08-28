"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";

interface PhotoUploaderProps {
  listingId: string;
  photos: string[];
  onChange: (photos: string[]) => void;
}

export default function PhotoUploader({ listingId, photos, onChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  async function uploadOne(file: File): Promise<string | null> {
    const presignRes = await fetch(`/api/listings/${listingId}/photos/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });

    if (presignRes.status === 501) {
      const data = await presignRes.json().catch(() => ({}));
      setNotConfigured(true);
      throw new Error(data.error ?? "S3 is not configured.");
    }

    if (!presignRes.ok) {
      const data = await presignRes.json().catch(() => ({}));
      throw new Error(data.error ?? "Could not prepare upload.");
    }

    const { uploadUrl, publicUrl } = await presignRes.json();

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error("Upload to S3 failed.");
    }

    const appendRes = await fetch(`/api/listings/${listingId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: publicUrl }),
    });
    if (!appendRes.ok) {
      const data = await appendRes.json().catch(() => ({}));
      throw new Error(data.error ?? "Could not save photo.");
    }

    return publicUrl;
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setError(null);
    setUploading(true);
    const uploaded: string[] = [];

    try {
      for (const file of files) {
        const url = await uploadOne(file);
        if (url) uploaded.push(url);
      }
      onChange([...photos, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(url: string) {
    onChange(photos.filter((p) => p !== url));
    // Best-effort: also remove from the persisted listing. Ignore failures
    // here since the local UI state is already updated.
    await fetch(`/api/listings/${listingId}/photos`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).catch(() => undefined);
  }

  return (
    <div>
      {photos.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-lg bg-ink-100">
              <Image src={url} alt="Listing photo" fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {notConfigured ? (
        <p className="rounded-lg bg-ink-100 px-3 py-2 text-sm text-ink-600">
          Photo uploads are disabled: S3 is not configured on this server.
          Set <code className="rounded bg-white px-1">AWS_REGION</code>,{" "}
          <code className="rounded bg-white px-1">AWS_ACCESS_KEY_ID</code>,{" "}
          <code className="rounded bg-white px-1">AWS_SECRET_ACCESS_KEY</code> and{" "}
          <code className="rounded bg-white px-1">S3_BUCKET_NAME</code> to enable them.
        </p>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={handleFiles}
            disabled={uploading}
            className="block w-full text-sm text-ink-600 file:mr-3 file:rounded-lg file:border-0 file:bg-ink-900 file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ink-800"
          />
          {uploading && <p className="mt-2 text-sm text-ink-500">Uploading...</p>}
        </>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
