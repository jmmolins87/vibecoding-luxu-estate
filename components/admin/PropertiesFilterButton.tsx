"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import FilterModal from "@/components/home/FilterModal";
import Icon from "@/components/ui/Icon";
import { hasActiveFilters, parseFilters } from "@/lib/filters";

/**
 * Botón "Filter" del admin: abre LA MISMA modal de filtros de la web
 * (`FilterModal`), aplicada sobre `/admin/properties`.
 * Se resalta en mosque cuando hay filtros activos en la URL.
 */
export default function PropertiesFilterButton({
  total,
  filterLabel,
}: {
  total: number;
  filterLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const active = hasActiveFilters(
    parseFilters(Object.fromEntries(searchParams.entries())),
  );

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm transition-colors ${
          active
            ? "border-mosque/30 bg-mosque/5 text-mosque dark:border-hint/30 dark:bg-mosque/20 dark:text-hint"
            : "border-nordic/10 bg-white text-nordic hover:bg-nordic/5 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
        }`}
      >
        <Icon name="tune" className="h-4 w-4" />
        {filterLabel}
      </button>
      <Suspense>
        <FilterModal
          open={open}
          onClose={() => setOpen(false)}
          total={total}
          basePath="/admin/properties"
        />
      </Suspense>
    </>
  );
}
