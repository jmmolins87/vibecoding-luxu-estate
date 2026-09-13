"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useTranslations } from "@/lib/i18n/client";

export default function Navbar() {
  const { t } = useTranslations();
  const links = [
    { key: "buy", label: t("nav.buy") },
    { key: "rent", label: t("nav.rent") },
    { key: "sell", label: t("nav.sell") },
    { key: "savedHomes", label: t("nav.savedHomes") },
  ];
  const [active, setActive] = useState(links[0].label);
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-nordic/10 bg-clearday/95 backdrop-blur-md dark:border-white/5 dark:bg-[#0f231f]/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            aria-label={t("nav.homeAriaLabel")}
            className="flex shrink-0 cursor-pointer items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nordic">
              <Icon name="building" className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-nordic dark:text-white">
              LuxeEstate
            </span>
          </Link>

          <div className="hidden items-center space-x-8 md:flex">
            {links.map((link) => (
              <a
                key={link.key}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActive(link.label);
                }}
                className={
                  active === link.label
                    ? "border-b-2 border-mosque px-1 py-1 text-sm font-medium text-mosque"
                    : "px-1 py-1 text-sm font-medium text-nordic/70 transition-all hover:border-b-2 hover:border-nordic/20 hover:text-nordic dark:text-gray-300 dark:hover:text-white"
                }
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              aria-label={t("nav.search")}
              className="text-nordic transition-colors hover:text-mosque dark:text-gray-400 dark:hover:text-white"
            >
              <Icon name="search" className="h-6 w-6" />
            </button>
            <button
              aria-label={t("nav.notifications")}
              className="relative text-nordic transition-colors hover:text-mosque dark:text-gray-400 dark:hover:text-white"
            >
              <Icon name="bell" className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full border-2 border-clearday bg-red-500 dark:border-[#0f231f]" />
            </button>
            <button
              aria-label={t("nav.profile")}
              className="ml-2 flex items-center gap-4 border-l border-nordic/10 pl-4 dark:border-white/10"
            >
              <LanguageSelector />
              <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200 ring-2 ring-transparent transition-all hover:ring-mosque">
                <img
                  alt={t("nav.profile")}
                  className="h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                />
              </div>
            </button>
            <button
              aria-label={t("nav.menu")}
              onClick={() => setOpen(!open)}
              className="text-nordic md:hidden dark:text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`overflow-hidden border-t border-nordic/5 bg-clearday transition-all duration-300 md:hidden dark:bg-[#0f231f] ${
          open ? "h-auto" : "h-0 border-t-0"
        }`}
      >
        <div className="space-y-1 px-4 py-2">
          {links.map((link) => (
            <a
              key={link.key}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActive(link.label);
                setOpen(false);
              }}
              className={
                active === link.label
                  ? "block rounded-md bg-mosque/10 px-3 py-2 text-base font-medium text-mosque"
                  : "block rounded-md px-3 py-2 text-base font-medium text-nordic hover:bg-black/5 dark:text-gray-200"
              }
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
