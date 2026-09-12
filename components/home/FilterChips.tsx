"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import {
  buildSearchParams,
  formatPriceShort,
  type PropertyFilters,
} from "@/lib/filters";

interface Chip {
  key: string;
  label: string;
  remove: Partial<PropertyFilters>;
}

/** Chips de filtros activos bajo el hero — cada ✕ quita ese filtro. */
export default function FilterChips({ filters }: { filters: PropertyFilters }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const chips: Chip[] = [];
  // El precio combina min+max en un solo chip → un if dedicado
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined)
    chips.push({
      key: "price",
      label:
        filters.minPrice !== undefined && filters.maxPrice !== undefined
          ? `${formatPriceShort(filters.minPrice)} – ${formatPriceShort(filters.maxPrice)}`
          : filters.minPrice !== undefined
            ? `From ${formatPriceShort(filters.minPrice)}`
            : `Up to ${formatPriceShort(filters.maxPrice ?? 0)}`,
      remove: { minPrice: undefined, maxPrice: undefined },
    });

  const entries = Object.entries(filters) as [
    keyof PropertyFilters,
    unknown,
  ][];
  for (const [key, value] of entries) {
    switch (key) {
      case "city":
        if (typeof value === "string" && value !== "")
          chips.push({
            key: "city",
            label: value,
            remove: { city: undefined },
          });
        break;
      case "beds":
        if (typeof value === "number")
          chips.push({
            key: "beds",
            label: `${value}+ beds`,
            remove: { beds: undefined },
          });
        break;
      case "baths":
        if (typeof value === "number")
          chips.push({
            key: "baths",
            label: `${value}+ baths`,
            remove: { baths: undefined },
          });
        break;
      case "type":
        if (typeof value === "string" && value !== "")
          chips.push({
            key: "type",
            label: value,
            remove: { type: undefined },
          });
        break;
      case "amenities":
        if (Array.isArray(value))
          for (const a of value)
            chips.push({
              key: `amenity-${String(a)}`,
              label: String(a),
              remove: {
                amenities: (filters.amenities ?? []).filter((x) => x !== a),
              },
            });
        break;
      case "status":
      case "minPrice":
      case "maxPrice":
        // estado → tabs; precio → chip combinado de arriba
        break;
    }
  }

  if (chips.length === 0) return null;

  const removeChip = (remove: Partial<PropertyFilters>) => {
    const status = searchParams.get("status") ?? undefined;
    // El spread con `undefined` explícito quita el filtro;
    // `buildSearchParams` omite vacíos y resetea a página 1.
    const qs = buildSearchParams({
      ...filters,
      ...remove,
      status: status as "sale" | "rent" | undefined,
    });
    router.push(qs ? `/?${qs}#market` : "/#market");
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 pb-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => removeChip(chip.remove)}
          className="flex items-center gap-1.5 rounded-full bg-mosque/10 px-3 py-1.5 text-xs font-medium text-mosque transition-colors hover:bg-mosque/20"
        >
          {chip.label}
          <Icon name="close" className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
