"use client";

import { createContext, useContext } from "react";
import { createTranslator, getDictionary, type Messages } from "./dictionaries";
import { defaultLocale, type Locale } from "./config";

type I18nContextValue = {
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
  dict: Messages;
};

const I18nContext = createContext<I18nContextValue>({
  locale: defaultLocale,
  t: (key) => key,
  dict: getDictionary(defaultLocale),
});

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Messages;
  children: React.ReactNode;
}) {
  const t = createTranslator(dict);
  return (
    <I18nContext.Provider value={{ locale, t, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations() {
  return useContext(I18nContext);
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}
