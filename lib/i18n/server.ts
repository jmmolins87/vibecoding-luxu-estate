import { cookies, headers } from "next/headers";
import { COOKIE_NAME, defaultLocale, isValidLocale, type Locale } from "./config";
import { createTranslator, getDictionary } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIE_NAME)?.value;
  if (isValidLocale(cookieLocale)) return cookieLocale;

  // Fallback: Accept-Language header (solo si no hay cookie)
  const headerList = await headers();
  const accept = headerList.get("accept-language");
  if (accept) {
    const preferred = accept.split(",")[0]?.split("-")[0]?.trim().toLowerCase();
    if (isValidLocale(preferred)) return preferred;
  }

  return defaultLocale;
}

export async function getTranslations() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = createTranslator(dict);
  return { t, locale, dict };
}
