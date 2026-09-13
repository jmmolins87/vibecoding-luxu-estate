"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth/AuthProvider";

export interface AdminTopNavItem {
  href: string;
  label: string;
}

export interface AdminTopNavUser {
  displayName: string;
  roleLabel: string;
  avatarUrl: string | null;
}

/**
 * Navbar superior del panel de administración.
 * Réplica del diseño `admin_user_directory_cards`: marca LuxeEstate,
 * pestañas Dashboard / Listings / Users / Inquiries y, a la derecha,
 * notificaciones + nombre/rol del admin con avatar.
 * Pulsar el avatar abre el menú de sesión (cerrar sesión).
 */
export default function AdminTopNav({
  items,
  user,
  homeAriaLabel,
  notificationsLabel,
  accountLabel,
  backToSiteLabel,
  signOutLabel,
  signingOutLabel,
}: {
  items: AdminTopNavItem[];
  user: AdminTopNavUser;
  homeAriaLabel: string;
  notificationsLabel: string;
  accountLabel: string;
  backToSiteLabel: string;
  signOutLabel: string;
  signingOutLabel: string;
}) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function handleSignOut() {
    setMenuOpen(false);
    startTransition(() => {
      void (async () => {
        // Cierre en el cliente (dueño de la sesión en cookies) y
        // navegación dura para rehidratar sin sesión.
        await signOut();
        window.location.href = "/";
      })();
    });
  }

  return (
    <nav className="border-b border-nordic/5 bg-white px-4 sm:px-6 lg:px-8 dark:border-white/5 dark:bg-[#0f231f]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            aria-label={homeAriaLabel}
            className="flex shrink-0 items-center gap-2"
          >
            <Icon name="building" className="h-6 w-6 text-mosque" />
            <span className="text-lg font-bold tracking-tight text-nordic dark:text-white">
              LuxeEstate
            </span>
          </Link>
          <div className="hidden space-x-8 md:flex">
            {items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : item.href !== "#" &&
                    (pathname === item.href ||
                      pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-mosque text-mosque"
                      : "border-transparent text-nordic/60 hover:text-mosque dark:text-gray-400 dark:hover:text-hint"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={notificationsLabel}
            className="relative p-2 text-nordic/60 transition-colors hover:text-mosque dark:text-gray-400 dark:hover:text-hint"
          >
            <Icon name="bell" className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0f231f]" />
          </button>
          <div
            ref={menuRef}
            className="relative flex items-center gap-3 border-l border-nordic/10 pl-4 dark:border-white/10"
          >
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-sm font-semibold text-nordic dark:text-white">
                {user.displayName}
              </span>
              <span className="text-xs text-nordic/60 dark:text-gray-400">
                {user.roleLabel}
              </span>
            </div>
            <button
              type="button"
              aria-label={accountLabel}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="h-9 w-9 overflow-hidden rounded-full bg-nordic/10 ring-2 ring-white transition-shadow hover:ring-mosque/40 dark:bg-white/10 dark:ring-[#0f231f] dark:hover:ring-hint/40"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  src={user.avatarUrl}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <Icon
                    name="user"
                    className="h-5 w-5 text-nordic/60 dark:text-gray-400"
                  />
                </span>
              )}
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-nordic/10 bg-white shadow-xl dark:border-white/10 dark:bg-[#152e2a]"
              >
                <div className="border-b border-nordic/5 px-4 py-3 dark:border-white/10">
                  <p className="truncate text-sm font-semibold text-nordic dark:text-white">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-nordic/60 dark:text-gray-400">
                    {user.roleLabel}
                  </p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-nordic transition-colors hover:bg-nordic/5 dark:text-gray-200 dark:hover:bg-white/10"
                  >
                    <Icon name="home" className="h-4 w-4" />
                    {backToSiteLabel}
                  </Link>
                </div>
                <div className="border-t border-nordic/5 dark:border-white/10" />
                <div className="p-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    disabled={isPending}
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-60 dark:text-red-400"
                  >
                    <Icon name="logout" className="h-4 w-4" />
                    {isPending ? signingOutLabel : signOutLabel}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
