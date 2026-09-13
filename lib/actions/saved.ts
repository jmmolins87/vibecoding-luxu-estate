"use server";

import { revalidatePath } from "next/cache";
import { createAuthServerSupabaseClient } from "@/lib/supabase/server";
import { mapRowToProperty, type PropertyRow } from "@/lib/properties";
import type { Property } from "@/types/property";

/**
 * Favoritos del usuario actual. Usan el cliente con SESIÓN (anon key +
 * JWT del usuario): las políticas RLS de `saved_homes` restringen cada
 * operación a las filas propias. Sin sesión devuelven vacío / error.
 */

async function requireUserId(): Promise<{ supabase: NonNullable<Awaited<ReturnType<typeof createAuthServerSupabaseClient>>>; userId: string }> {
  const supabase = await createAuthServerSupabaseClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión requerida.");
  return { supabase, userId: user.id };
}

/** Ids de propiedades guardadas por el usuario actual ([] sin sesión). */
export async function getSavedPropertyIds(): Promise<string[]> {
  try {
    const { supabase, userId } = await requireUserId();
    const { data, error } = await supabase
      .from("saved_homes")
      .select("property_id")
      .eq("user_id", userId);
    if (error || !data) return [];
    return data.map((r) => r.property_id as string);
  } catch {
    return [];
  }
}

/** Alterna el favorito. Devuelve el estado resultante. Exige sesión. */
export async function toggleSavedProperty(
  propertyId: string,
): Promise<{ saved: boolean }> {
  const { supabase, userId } = await requireUserId();

  const { data: existing } = await supabase
    .from("saved_homes")
    .select("property_id")
    .eq("user_id", userId)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saved_homes")
      .delete()
      .eq("user_id", userId)
      .eq("property_id", propertyId);
    if (error) throw new Error(error.message);
    revalidatePath("/saved");
    return { saved: false };
  }

  const { error } = await supabase
    .from("saved_homes")
    .insert({ user_id: userId, property_id: propertyId });
  if (error) throw new Error(error.message);
  revalidatePath("/saved");
  return { saved: true };
}

/** Propiedades guardadas (para la página /saved). Exige sesión. */
export async function getSavedProperties(): Promise<Property[]> {
  const { supabase, userId } = await requireUserId();

  const { data: saved, error: savedError } = await supabase
    .from("saved_homes")
    .select("property_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (savedError || !saved || saved.length === 0) return [];

  const ids = saved.map((r) => r.property_id as string);
  const { data: rows, error: propsError } = await supabase
    .from("properties")
    .select("*")
    .in("id", ids)
    .eq("is_active", true);

  if (propsError || !rows) return [];

  const byId = new Map(
    (rows as PropertyRow[]).map((row) => [row.id, mapRowToProperty(row)]),
  );
  // Conserva el orden de guardado (más recientes primero).
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is Property => p !== undefined);
}
