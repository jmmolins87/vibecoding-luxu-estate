export const locales = ["en", "es", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
};

export const COOKIE_NAME = "locale";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isValidLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
