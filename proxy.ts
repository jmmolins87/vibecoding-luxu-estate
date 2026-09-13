import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { COOKIE_MAX_AGE, COOKIE_NAME, defaultLocale, isValidLocale } from "@/lib/i18n/config";
import { ADMIN_ROLE } from "@/lib/auth/roles";

/** Rutas que exigen sesión: redirigen a `/?login=required&next=...`. */
const PROTECTED_PREFIXES = ["/saved"];

/** Rutas que exigen rol `admin`: sin sesión van al login, sin rol van a `/`. */
const ADMIN_PREFIXES = ["/admin"];

function matches(pathname: string, prefixes: string[]): string | null {
  const hit = prefixes.find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return hit ?? null;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  // --- Locale: sin cookie → detecta de Accept-Language y persiste ---
  if (!isValidLocale(request.cookies.get(COOKIE_NAME)?.value)) {
    const accept = request.headers.get("accept-language");
    const preferred = accept?.split(",")[0]?.split("-")[0]?.trim().toLowerCase();
    const locale = isValidLocale(preferred) ? preferred : defaultLocale;
    response.cookies.set(COOKIE_NAME, locale, {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  // --- Supabase: refresca la sesión en cookies ---
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // --- Rutas protegidas con redirección al login modal ---
    const pathname = request.nextUrl.pathname;
    if (!user && matches(pathname, PROTECTED_PREFIXES)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.searchParams.set("login", "required");
      redirectUrl.searchParams.set("next", pathname);
      const redirect = NextResponse.redirect(redirectUrl);
      const localeCookie = response.cookies.get(COOKIE_NAME)?.value;
      if (localeCookie) {
        redirect.cookies.set(COOKIE_NAME, localeCookie, {
          maxAge: COOKIE_MAX_AGE,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      }
      return redirect;
    }

    // --- Rutas de administración: exigen sesión + rol `admin` ---
    const adminHit = matches(pathname, ADMIN_PREFIXES);
    if (adminHit) {
      if (!user) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/";
        redirectUrl.searchParams.set("login", "required");
        redirectUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleRow?.role !== ADMIN_ROLE) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/";
        redirectUrl.search = "";
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/locale).*)"],
};
