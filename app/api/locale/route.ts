import { NextResponse } from "next/server";
import { COOKIE_MAX_AGE, COOKIE_NAME, isValidLocale } from "@/lib/i18n/config";

export async function POST(request: Request) {
  const { locale } = await request.json();
  if (!isValidLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, locale, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
