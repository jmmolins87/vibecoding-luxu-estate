import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { COOKIE_MAX_AGE, COOKIE_NAME, defaultLocale, isValidLocale } from "@/lib/i18n/config";

/** Rutas que exigen sesión: redirigen a `/?login=required&next=...`. */
const PROTECTED_PREFIXES = ["/saved"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
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
    if (!user && isProtected(pathname)) {
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
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/locale).*)"],
};
