import en from "@/messages/en.json";
import es from "@/messages/es.json";
import fr from "@/messages/fr.json";
import { defaultLocale, type Locale } from "./config";

const dictionaries = { en, es, fr } as const;

export type Messages = typeof en;

// Para añadir un idioma: 1) crea messages/xx.json 2) importa aquí 3) añade a locales en config.ts
export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

// Resuelve una clave anidada "a.b.c" en el diccionario. Soporta interpolación {var} y plural básico.
export function createTranslator(dict: Messages) {
  return function t(
    key: string,
    params?: Record<string, string | number>,
  ): string {
    const parts = key.split(".");
    let value: unknown = dict;
    for (const p of parts) {
      if (value && typeof value === "object" && p in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[p];
      } else {
        return key;
      }
    }
    if (typeof value !== "string") return key;

    let result = value;

    // Plural simple: "{count, plural, one {X} other {Y}}"
    if (params?.count !== undefined) {
      const count = Number(params.count);
      const pluralMatch = result.match(/\{count,\s*plural,\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\}/);
      if (pluralMatch) {
        const replacement = count === 1 ? pluralMatch[1] : pluralMatch[2];
        result = result.replace(pluralMatch[0], replacement);
      }
    }

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replaceAll(`{${k}}`, String(v));
      }
    }
    return result;
  };
}

export type Translator = ReturnType<typeof createTranslator>;
