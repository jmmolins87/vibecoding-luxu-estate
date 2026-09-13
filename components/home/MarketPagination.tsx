"use client";

import Link from "next/link";
import type { PropertyStatusFilter } from "@/lib/properties";
import type { PropertyFilters } from "@/lib/filters";
import { buildSearchParams } from "@/lib/filters";
import { useTranslations } from "@/lib/i18n/client";

interface MarketPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  status: PropertyStatusFilter;
  filters: PropertyFilters;
}

function pageHref(
  page: number,
  status: PropertyStatusFilter,
  filters: PropertyFilters,
): string {
  const qs = buildSearchParams({ ...filters, status });
  const sep = qs ? `${qs}&` : "";
  return `/?${sep}page=${page}#market`;
}

/** Devuelve los números de página a mostrar (ventana de hasta 5). */
function visiblePages(page: number, totalPages: number): number[] {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function MarketPagination({
  page,
  totalPages,
  total,
  status,
  filters,
}: MarketPaginationProps) {
  const { t } = useTranslations();
  if (totalPages <= 1) return null;

  const linkBase =
    "rounded-lg border px-4 py-2 text-sm font-medium transition-all";
  const linkIdle =
    "border-nordic/10 bg-white text-nordic hover:border-mosque hover:text-mosque dark:border-white/10 dark:bg-white/5 dark:text-white";
  const linkActive = "border-mosque bg-mosque text-white shadow-md";
  const linkDisabled = "cursor-not-allowed opacity-40";

  return (
    <nav
      aria-label={t("pagination.ariaLabel")}
      className="mt-10 flex flex-col items-center gap-3"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {page > 1 ? (
          <Link
            href={pageHref(page - 1, status, filters)}
            className={`${linkBase} ${linkIdle}`}
          >
            ← {t("pagination.previous")}
          </Link>
        ) : (
          <span className={`${linkBase} ${linkIdle} ${linkDisabled}`}>
            ← {t("pagination.previous")}
          </span>
        )}

        {visiblePages(page, totalPages).map((p) => (
          <Link
            key={p}
            href={pageHref(p, status, filters)}
            aria-current={p === page ? "page" : undefined}
            className={`${linkBase} ${p === page ? linkActive : linkIdle}`}
          >
            {p}
          </Link>
        ))}

        {page < totalPages ? (
          <Link
            href={pageHref(page + 1, status, filters)}
            className={`${linkBase} ${linkIdle}`}
          >
            {t("pagination.next")} →
          </Link>
        ) : (
          <span className={`${linkBase} ${linkIdle} ${linkDisabled}`}>
            {t("pagination.next")} →
          </span>
        )}
      </div>
      <p className="text-xs text-nordic-muted">
        {t("pagination.pageInfo", { page, totalPages, total })}
      </p>
    </nav>
  );
}
