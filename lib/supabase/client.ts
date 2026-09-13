import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para usar SOLO en el navegador
 * (Client Components, AuthProvider, LoginModal).
 * Persiste la sesión en cookies para compartirla con el servidor.
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.",
    );
  }

  return createBrowserClient(url, anonKey);
}
