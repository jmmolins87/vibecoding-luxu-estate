# i18n — Guía rápida

## Idiomas actuales
`en` (English, default) · `es` (Español) · `fr` (Français)

## Cómo añadir un idioma (ej. `de`)

1. **Traducciones**: duplica `messages/en.json` → `messages/de.json` y traduce todos los valores (mantén las mismas keys).
2. **Registro**: edita `lib/i18n/config.ts` → añade `"de"` a `locales` y entradas en `localeNames` / `localeFlags`.
3. **Diccionario**: edita `lib/i18n/dictionaries.ts` → importa `de` y añádelo a `dictionaries`.
4. **Build & test**: `pnpm build` y prueba con `curl -H "Cookie: locale=de" http://localhost:3000/`.

No hay rutas con prefijo (`/es/...`): el idioma vive en la cookie `locale` (1 año, `SameSite=Lax`). El middleware la crea en la primera visita desde `Accept-Language`. El selector (`LanguageSelector`) la actualiza vía `/api/locale` + `router.refresh()`.

## Uso en código

**Server Component**:
```tsx
import { getTranslations } from "@/lib/i18n/server";
export default async function Page() {
  const { t, locale } = await getTranslations();
  return <h1>{t("hero.findYour")}</h1>
}
```

**Client Component**:
```tsx
"use client";
import { useTranslations } from "@/lib/i18n/client";
export default function MyClient() {
  const { t } = useTranslations();
  return <button>{t("common.search")}</button>
}
```

Interpolación: `t("filters.showHomes", { count: 5 })` — soporta plural `one/other`.
Formato de precio: `formatPrice(property, locale)` con `es-ES` / `fr-FR` / `en-US`.
