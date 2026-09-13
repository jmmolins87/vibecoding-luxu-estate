"use client";

import Link from "next/link";
import type { PropertyStatusFilter } from "@/lib/properties";
import type { PropertyFilters } from "@/lib/filters";
import { buildSearchParams } from "@/lib/filters";
import { useTranslations } from "@/lib/i18n/client";

function tabHref(
  status: PropertyStatusFilter,
  filters: PropertyFilters,
): string {
  const qs = buildSearchParams({ ...filters, status });
  return qs ? `/?${qs}#market` : "/#market";
}

export default function MarketTabs({
  active,
  filters,
}: {
  active: PropertyStatusFilter;
  filters: PropertyFilters;
}) {
  const { t } = useTranslations();
  const tabs: { value: PropertyStatusFilter; label: string }[] = [
    { value: "all", label: t("market.tabs.all") },
    { value: "sale", label: t("market.tabs.buy") },
    { value: "rent", label: t("market.tabs.rent") },
  ];
  return (
    <div className="hidden rounded-lg bg-white p-1 md:flex dark:bg-white/5">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={tabHref(tab.value, filters)}
          aria-current={active === tab.value ? "true" : undefined}
          className={
            active === tab.value
              ? "rounded-md bg-nordic px-4 py-1.5 text-sm font-medium text-white shadow-sm"
              : "rounded-md px-4 py-1.5 text-sm font-medium text-nordic-muted hover:text-nordic dark:hover:text-white"
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
