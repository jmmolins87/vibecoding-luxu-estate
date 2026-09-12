"use client";

import Link from "next/link";
import type { PropertyStatusFilter } from "@/lib/properties";

const tabs: { value: PropertyStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sale", label: "Buy" },
  { value: "rent", label: "Rent" },
];

function tabHref(status: PropertyStatusFilter): string {
  return status === "all" ? "/#market" : `/?status=${status}#market`;
}

export default function MarketTabs({
  active,
}: {
  active: PropertyStatusFilter;
}) {
  return (
    <div className="hidden rounded-lg bg-white p-1 md:flex dark:bg-white/5">
      {tabs.map((t) => (
        <Link
          key={t.value}
          href={tabHref(t.value)}
          aria-current={active === t.value ? "true" : undefined}
          className={
            active === t.value
              ? "rounded-md bg-nordic px-4 py-1.5 text-sm font-medium text-white shadow-sm"
              : "rounded-md px-4 py-1.5 text-sm font-medium text-nordic-muted hover:text-nordic dark:hover:text-white"
          }
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
