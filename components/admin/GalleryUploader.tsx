"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Icon from "@/components/ui/Icon";
import {
  createImageUploads,
  deletePropertyImage,
} from "@/lib/actions/property-images";
import { MAX_IMAGE_BYTES } from "@/lib/supabase/storage";

export interface GalleryUploaderLabels {
  dropTitle: string;
  dropHint: string;
  formats: string;
  main: string;
  deleteImage: string;
  setMain: string;
  addMore: string;
  invalidType: string;
  tooLarge: string;
  uploadFailed: string;
}

interface PendingUpload {
  id: string;
  name: string;
  progress: number;
  error: string | null;
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** PUT directo al bucket con progreso real (XHR). */
function putFile(
  signedUrl: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });
}

/**
 * Galería del diseño `add_edit_property_form`: zona drag&drop con subida
 * DIRECTA al bucket `property-images` (URL firmada + barra de progreso
 * por archivo), rejilla con badge "Main" en `images[0]`, borrar y
 * marcar principal. Los bytes nunca pasan por el servidor Next.
 */
export default function GalleryUploader({
  images,
  onChange,
  labels,
}: {
  images: string[];
  onChange: (next: string[] | ((prev: string[]) => string[])) => void;
  labels: GalleryUploaderLabels;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(list: FileList | File[]) {
    const files = Array.from(list);
    if (files.length === 0) return;
    setError(null);
    for (const f of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
        setError(labels.invalidType);
        return;
      }
      if (f.size <= 0 || f.size > MAX_IMAGE_BYTES) {
        setError(labels.tooLarge);
        return;
      }
    }

    const batch: PendingUpload[] = files.map((f) => ({
      id: newId(),
      name: f.name,
      progress: 0,
      error: null,
    }));
    setPending((p) => [...p, ...batch]);

    let slots: { signedUrl: string; publicUrl: string }[];
    try {
      ({ slots } = await createImageUploads(files.map((f) => f.type)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : labels.uploadFailed;
      setPending((p) =>
        p.map((u) =>
          batch.some((b) => b.id === u.id) ? { ...u, error: msg } : u,
        ),
      );
      return;
    }

    const doneUrls: string[] = [];
    await Promise.all(
      files.map((file, i) =>
        putFile(slots[i].signedUrl, file, (progress) => {
          setPending((p) =>
            p.map((u) => (u.id === batch[i].id ? { ...u, progress } : u)),
          );
        })
          .then(() => {
            doneUrls.push(slots[i].publicUrl);
          })
          .catch(() => {
            setPending((p) =>
              p.map((u) =>
                u.id === batch[i].id ? { ...u, error: labels.uploadFailed } : u,
              ),
            );
          }),
      ),
    );
    if (doneUrls.length > 0) {
      onChange((prev) => [...prev, ...doneUrls]);
    }
    // Retira los completados; los fallidos quedan visibles con su error.
    setPending((p) =>
      p.filter(
        (u) => !(batch.some((b) => b.id === u.id) && u.error === null),
      ),
    );
    if (inputRef.current) inputRef.current.value = "";
  }

  function dismissPending(id: string) {
    setPending((p) => p.filter((u) => u.id !== id));
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) void uploadFiles(e.target.files);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) void uploadFiles(e.dataTransfer.files);
  }

  async function removeAt(index: number) {
    const url = images[index];
    const next = images.filter((_, i) => i !== index);
    onChange(next);
    try {
      await deletePropertyImage(url);
    } catch {
      // La URL ya salió del formulario; el borrado del bucket es best-effort.
    }
  }

  function makeMain(index: number) {
    if (index === 0) return;
    onChange([images[index], ...images.filter((_, i) => i !== index)]);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed bg-gray-50/50 p-10 text-center transition-colors group dark:bg-white/5 ${
          dragging
            ? "border-mosque/60 bg-hint/20"
            : "border-gray-300 hover:border-mosque/40 hover:bg-hint/10 dark:border-white/10"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={onInputChange}
          aria-label={labels.dropTitle}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-mosque shadow-sm transition-transform duration-300 group-hover:scale-110 dark:bg-white/10 dark:text-hint">
            <Icon name="plus" className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium text-nordic dark:text-white">
              {labels.dropTitle}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {labels.dropHint}
            </p>
          </div>
        </div>
      </div>

      {pending.length > 0 && (
        <ul className="mt-4 space-y-2">
          {pending.map((u) => (
            <li
              key={u.id}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm text-nordic dark:text-gray-200">
                  {u.name}
                </span>
                {u.error ? (
                  <button
                    type="button"
                    onClick={() => dismissPending(u.id)}
                    aria-label={labels.deleteImage}
                    className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:text-red-500"
                  >
                    <Icon name="close" className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="shrink-0 text-xs font-medium text-mosque tabular-nums dark:text-hint">
                    {u.progress}%
                  </span>
                )}
              </div>
              {u.error ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {u.error}
                </p>
              ) : (
                <div
                  role="progressbar"
                  aria-valuenow={u.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10"
                >
                  <div
                    className="h-full rounded-full bg-mosque transition-[width] duration-200"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="group relative aspect-square overflow-hidden rounded-lg shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                src={src}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-nordic/60 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  title={labels.deleteImage}
                  aria-label={`${labels.deleteImage} ${i + 1}`}
                  onClick={() => void removeAt(i)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 transition-colors hover:bg-red-50"
                >
                  <Icon name="delete" className="h-4 w-4" />
                </button>
                {i !== 0 && (
                  <button
                    type="button"
                    title={labels.setMain}
                    aria-label={`${labels.setMain} ${i + 1}`}
                    onClick={() => makeMain(i)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-nordic transition-colors hover:bg-gray-50"
                  >
                    <Icon name="check" className="h-4 w-4" />
                  </button>
                )}
              </div>
              {i === 0 && (
                <span className="absolute top-2 left-2 rounded bg-mosque px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
                  {labels.main}
                </span>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="group flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400 transition-all hover:border-mosque hover:bg-hint/20 hover:text-mosque dark:border-white/10 dark:hover:border-hint"
          >
            <Icon name="plus" className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span className="mt-1 text-xs font-medium">{labels.addMore}</span>
          </button>
        </div>
      )}
    </div>
  );
}
