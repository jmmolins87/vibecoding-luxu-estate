"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/ui/Icon";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: IconName;
}

export default function AdminSidebarNav({
  items,
  ariaLabel,
}: {
  items: AdminNavItem[];
  ariaLabel: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel} className="space-y-1">
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "flex items-center gap-3 rounded-lg bg-mosque px-3 py-2.5 text-sm font-medium text-white"
                : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-nordic/70 transition-colors hover:bg-nordic/5 hover:text-nordic dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
            }
          >
            <Icon name={item.icon} className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
