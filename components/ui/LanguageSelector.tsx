"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { locales, localeFlags, localeNames, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/client";

export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const changeLocale = (next: Locale) => {
    if (next === locale) {
      setOpen(false);
      return;
    }
    // Persistencia vía cookie (endpoint dedicado, no depende de JS externo)
    fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    }).finally(() => {
      // Fallback inmediato por si el fetch falla (cookie cliente directa)
      document.cookie = `locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
      setOpen(false);
      startTransition(() => router.refresh());
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Language selector"
        aria-expanded={open}
        disabled={pending}
        className="flex items-center gap-1.5 rounded-full border border-nordic/10 bg-white px-3 py-1.5 text-sm font-medium text-nordic transition-colors hover:border-mosque/30 hover:text-mosque dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:border-mosque/50"
      >
        <span aria-hidden>{localeFlags[locale]}</span>
        <span className="hidden sm:inline">{locale.toUpperCase()}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-nordic/5 bg-white py-1 shadow-xl dark:border-white/10 dark:bg-[#1a332e]">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => changeLocale(l)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-mosque/5 dark:hover:bg-white/5 ${
                  l === locale ? "bg-mosque/10 font-semibold text-mosque" : "text-nordic dark:text-gray-200"
                }`}
              >
                <span aria-hidden className="text-base">{localeFlags[l]}</span>
                <span className="flex-1">{localeNames[l]}</span>
                {l === locale && (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-mosque">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.94 3.94 7.47-9.806a.75.75 0 011.014-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
