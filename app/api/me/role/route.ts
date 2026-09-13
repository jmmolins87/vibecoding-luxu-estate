import { NextResponse } from "next/server";
import { createAuthServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/auth/roles";

/** Rol del usuario actual (`admin` | `user` | null sin sesión). */
export async function GET() {
  const supabase = await createAuthServerSupabaseClient();
  if (!supabase) return NextResponse.json({ role: null });

  const role = await getCurrentUserRole(supabase);
  return NextResponse.json({ role });
}
