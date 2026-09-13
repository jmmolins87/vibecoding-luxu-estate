import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_MAX_AGE, COOKIE_NAME, defaultLocale, isValidLocale } from "@/lib/i18n/config";

export function proxy(request: NextRequest) {
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value;
  if (isValidLocale(cookieLocale)) {
    return NextResponse.next();
  }

  // Sin cookie → detecta del Accept-Language y persiste
  const accept = request.headers.get("accept-language");
  const preferred = accept?.split(",")[0]?.split("-")[0]?.trim().toLowerCase();
  const locale = isValidLocale(preferred) ? preferred : defaultLocale;

  const res = NextResponse.next();
  res.cookies.set(COOKIE_NAME, locale, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/locale).*)"],
};
