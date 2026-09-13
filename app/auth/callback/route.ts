import { NextResponse, type NextRequest } from "next/server";
import { createAuthServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Callback OAuth de Supabase: intercambia `code` por sesión en cookies
 * y redirige al destino `next` (por defecto `/`).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createAuthServerSupabaseClient();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
