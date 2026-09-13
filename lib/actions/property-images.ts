"use server";

import {
  createAuthServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { ADMIN_ROLE } from "@/lib/auth/roles";
import {
  ALLOWED_IMAGE_MIME,
  PROPERTY_IMAGES_BUCKET,
  buildTempImagePath,
  getPropertyImagePublicUrl,
  parsePropertyImagePath,
} from "@/lib/supabase/storage";

async function requireAdminService() {
  const supabase = await createAuthServerSupabaseClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión requerida.");
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (roleRow?.role !== ADMIN_ROLE) {
    throw new Error("Se requiere rol de administrador.");
  }
  const service = createServiceSupabaseClient();
  if (!service) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  }
  return service;
}

export interface ImageUploadSlot {
  path: string;
  signedUrl: string;
  publicUrl: string;
}

const MAX_FILES_PER_BATCH = 10;

/**
 * Crea URLs firmadas para subir imágenes DIRECTO al bucket
 * `property-images` desde el navegador (PUT a `signedUrl`).
 * Los bytes nunca pasan por la Server Action: evita el límite
 * de body de Next ("Unexpected end of form" con archivos grandes)
 * y permite mostrar progreso real de subida.
 */
export async function createImageUploads(
  mimes: string[],
): Promise<{ slots: ImageUploadSlot[] }> {
  const service = await requireAdminService();
  if (mimes.length === 0 || mimes.length > MAX_FILES_PER_BATCH) {
    throw new Error("Número de archivos no válido.");
  }
  for (const mime of mimes) {
    if (!(ALLOWED_IMAGE_MIME as readonly string[]).includes(mime)) {
      throw new Error("Formato no válido. Usa JPG, PNG o WEBP.");
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const slots: ImageUploadSlot[] = [];
  for (const mime of mimes) {
    const path = buildTempImagePath(mime);
    const { data, error } = await service.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .createSignedUploadUrl(path);
    if (error || !data?.signedUrl) {
      throw new Error(error?.message ?? "No se pudo preparar la subida.");
    }
    slots.push({
      path,
      signedUrl: data.signedUrl,
      publicUrl: getPropertyImagePublicUrl(supabaseUrl, path),
    });
  }
  return { slots };
}

/**
 * Borra del bucket una imagen previamente subida (solo URLs del bucket;
 * las externas como Unsplash se ignoran).
 */
export async function deletePropertyImage(url: string): Promise<{ ok: true }> {
  const service = await requireAdminService();
  const path = parsePropertyImagePath(url);
  if (!path) return { ok: true };
  const { error } = await service.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .remove([path]);
  if (error) throw new Error(error.message);
  return { ok: true };
}
