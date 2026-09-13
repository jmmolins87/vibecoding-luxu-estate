"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { getAvatarUrl, getDisplayName, useAuth } from "@/lib/auth/AuthProvider";
import { useTranslations } from "@/lib/i18n/client";

export default function Navbar() {
  const { t } = useTranslations();
  const { user, role, isLoading, openLogin, signOut } = useAuth();
  const links = [
    { key: "buy", label: t("nav.buy"), href: "/" },
    { key: "rent", label: t("nav.rent"), href: "/" },
    { key: "sell", label: t("nav.sell"), href: "/" },
    { key: "savedHomes", label: t("nav.savedHomes"), href: "/saved" },
  ];
  const [active, setActive] = useState(links[0].label);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const avatarUrl = getAvatarUrl(user);
  const displayName = getDisplayName(user);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

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
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setActive(link.label)}
                className={
                  active === link.label
                    ? "border-b-2 border-mosque px-1 py-1 text-sm font-medium text-mosque"
                    : "px-1 py-1 text-sm font-medium text-nordic/70 transition-all hover:border-b-2 hover:border-nordic/20 hover:text-nordic dark:text-gray-300 dark:hover:text-white"
                }
              >
                {link.label}
              </Link>
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
            <div className="flex gap-2 border-l border-nordic/10 pl-4 dark:border-white/10">
              <LanguageSelector />
              {isLoading ? (
                <span className="ml-2 h-9 w-9 animate-pulse rounded-full bg-nordic/10 pl-2 dark:bg-white/10" />
              ) : user ? (
                <div ref={menuRef} className="relative ml-2">
                  <button
                    aria-label={t("nav.profile")}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-2"
                  >
                    <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-mosque font-semibold text-white ring-2 ring-transparent transition-all hover:ring-mosque">
                      {avatarUrl ? (
                        <img
                          alt={displayName || t("nav.profile")}
                          className="h-full w-full object-cover"
                          src={avatarUrl}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span aria-hidden="true">
                          {(displayName || "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                  </button>
                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-nordic/10 bg-white shadow-soft dark:border-white/10 dark:bg-[#0f231f]"
                    >
                      <div className="border-b border-nordic/10 px-4 py-3 dark:border-white/10">
                        <p className="truncate text-sm font-semibold text-nordic dark:text-white">
                          {displayName || t("nav.account")}
                        </p>
                        {user.email && (
                          <p className="truncate text-xs text-nordic/60 dark:text-gray-400">
                            {user.email}
                          </p>
                        )}
                      </div>
                      <div className="p-1.5">
                        {role === "admin" && (
                          <Link
                            href="/admin"
                            role="menuitem"
                            onClick={() => setMenuOpen(false)}
                            className="block rounded-lg px-3 py-2 text-sm font-medium text-mosque transition-colors hover:bg-mosque/10 dark:text-hint"
                          >
                            {t("nav.admin")}
                          </Link>
                        )}
                        <Link
                          href="/saved"
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm text-nordic transition-colors hover:bg-nordic/5 dark:text-gray-200 dark:hover:bg-white/10"
                        >
                          {t("nav.savedHomes")}
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuOpen(false);
                            signOut();
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                        >
                          {t("nav.signOut")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openLogin()}
                  className="ml-2 rounded-lg bg-mosque px-4 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-mosque/90 hover:shadow-soft"
                >
                  {t("nav.signIn")}
                </button>
              )}
            </div>
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
        className={`overflow-hidden border-t border-nordic/5 bg-clearday transition-all duration-300 md:hidden dark:bg-[#0f231f] ${open ? "h-auto" : "h-0 border-t-0"
          }`}
      >
        <div className="space-y-1 px-4 py-2">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => {
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
            </Link>
          ))}
          {!isLoading &&
            (user ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-red-600 dark:text-red-400"
              >
                {t("nav.signOut")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openLogin();
                }}
                className="mt-1 block w-full rounded-lg bg-mosque px-3 py-2 text-left text-base font-medium text-white"
              >
                {t("nav.signIn")}
              </button>
            ))}
        </div>
      </div>
    </nav>
  );
}
