/**
 * Constantes y helpers del bucket `property-images` de Supabase Storage.
 * La subida/borrado real vive en `lib/actions/property-images.ts`
 * (Server Actions con SERVICE ROLE). Aquí solo validación y URLs públicas.
 */

export const PROPERTY_IMAGES_BUCKET = "property-images";

/** 25 MB por imagen. */
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function isAllowedImageMime(mime: string): boolean {
  return (ALLOWED_IMAGE_MIME as readonly string[]).includes(mime);
}

function extensionFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

/** Ruta `tmp/<uuid>.<ext>` para subidas previas a conocer el id final. */
export function buildTempImagePath(mime: string): string {
  return `tmp/${randomId()}.${extensionFor(mime)}`;
}

/** URL pública de un objeto del bucket. */
export function getPropertyImagePublicUrl(
  supabaseUrl: string,
  path: string,
): string {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${PROPERTY_IMAGES_BUCKET}/${path}`;
}

/** Extrae el `path` interno si la URL pertenece a nuestro bucket. */
export function parsePropertyImagePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${PROPERTY_IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
