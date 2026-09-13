import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "admin" | "user";

export const ADMIN_ROLE: UserRole = "admin";
export const DEFAULT_ROLE: UserRole = "user";

/**
 * Lee el rol del usuario actual desde `public.user_roles`.
 * Si el usuario autenticado aún no tiene fila (p. ej. anterior al trigger
 * de la migración 006), la crea automáticamente con el rol por defecto
 * 'user' — la política `user_roles_own_insert` solo permite auto-asignarse
 * ese rol, nunca 'admin'.
 * Devuelve `null` solo si no hay sesión o si la BD no es accesible.
 */
export async function getCurrentUserRole(
  supabase: SupabaseClient,
): Promise<UserRole | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!error && data) {
    return data.role === ADMIN_ROLE ? ADMIN_ROLE : DEFAULT_ROLE;
  }

  // Sin fila: auto-creación con el rol por defecto (idempotente ante
  // carreras concurrentes gracias a `ignoreDuplicates`).
  const { error: insertError } = await supabase.from("user_roles").upsert(
    { user_id: user.id, role: DEFAULT_ROLE },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
  if (insertError) return null;

  const { data: retry } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!retry) return DEFAULT_ROLE;
  return retry.role === ADMIN_ROLE ? ADMIN_ROLE : DEFAULT_ROLE;
}

/** `true` solo si el usuario actual tiene rol `admin`. */
export async function isCurrentUserAdmin(
  supabase: SupabaseClient,
): Promise<boolean> {
  return (await getCurrentUserRole(supabase)) === ADMIN_ROLE;
}
