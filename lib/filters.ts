import type { PropertyStatus, PropertyType } from "@/types/property";
import type { IconName } from "@/components/ui/Icon";

/** Filtros de búsqueda. `undefined` = sin filtrar. */
export interface PropertyFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  type?: PropertyType;
  amenities?: string[];
  /** `"all"` = sin filtrar por estado (lo usan paginación y tabs). */
  status?: PropertyStatus | "all";
}

export interface AmenityOption {
  value: string;
  label: string;
  icon: IconName;
}

/** Amenidades del modal — los `value` deben coincidir EXACTO con la BD. */
export const AMENITY_OPTIONS: AmenityOption[] = [
  { value: "Swimming Pool", label: "Swimming Pool", icon: "pool" },
  { value: "Gym", label: "Gym", icon: "fitness" },
  { value: "Parking", label: "Parking", icon: "parking" },
  { value: "Air Conditioning", label: "Air Conditioning", icon: "ac" },
  { value: "High-speed Wifi", label: "High-speed Wifi", icon: "wifi" },
  { value: "Patio / Terrace", label: "Patio / Terrace", icon: "terrace" },
];

export const PROPERTY_TYPES: PropertyType[] = [
  "House",
  "Apartment",
  "Villa",
  "Penthouse",
];

function num(v: string | undefined): number | undefined {
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Lee los filtros desde los searchParams de la URL. */
export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): PropertyFilters {
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const type = one(params.type);
  const status = one(params.status);
  const amenities = one(params.amenities);

  return {
    city: one(params.city) || undefined,
    minPrice: num(one(params.minPrice)),
    maxPrice: num(one(params.maxPrice)),
    beds: num(one(params.beds)),
    baths: num(one(params.baths)),
    type: PROPERTY_TYPES.includes(type as PropertyType)
      ? (type as PropertyType)
      : undefined,
    amenities: amenities
      ? amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean)
      : undefined,
    status:
      status === "sale" || status === "rent"
        ? (status as PropertyStatus)
        : undefined,
  };
}

/**
 * Construye el querystring desde filtros parciales.
 * Orden alfabético, omite vacíos/defaults. Nunca incluye `page`
 * (cambiar filtros siempre vuelve a la página 1).
 */
export function buildSearchParams(
  filters: Partial<PropertyFilters> & { status?: PropertyStatus | "all" },
): string {
  const p = new URLSearchParams();
  const entries = Object.entries(filters) as [
    keyof PropertyFilters,
    unknown,
  ][];
  for (const [key, value] of entries) {
    switch (key) {
      case "amenities":
        if (Array.isArray(value) && value.length > 0)
          p.set(key, value.join(","));
        break;
      case "baths":
      case "beds":
      case "maxPrice":
      case "minPrice":
        if (typeof value === "number") p.set(key, String(value));
        break;
      case "city":
      case "type":
        if (typeof value === "string" && value !== "") p.set(key, value);
        break;
      case "status":
        if (value === "sale" || value === "rent") p.set(key, value);
        break;
    }
  }
  p.sort();
  return p.toString();
}

/** Formato corto para el label del rango: 1200000 → "$1.2M". */
export function formatPriceShort(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return `$${Number.isInteger(k) ? k : k.toFixed(0)}K`;
  }
  return `$${n}`;
}

/** Nº de filtros activos (para el badge del botón Filters). */
export function countActiveFilters(f: PropertyFilters): number {
  const entries = Object.entries(f) as [keyof PropertyFilters, unknown][];
  let n = 0;
  let priceCounted = false;
  for (const [key, value] of entries) {
    switch (key) {
      case "city":
      case "type":
        if (typeof value === "string" && value !== "") n++;
        break;
      case "beds":
      case "baths":
        if (typeof value === "number") n++;
        break;
      case "minPrice":
      case "maxPrice":
        // min+max cuentan como un solo filtro de precio
        if (typeof value === "number" && !priceCounted) {
          n++;
          priceCounted = true;
        }
        break;
      case "amenities":
        if (Array.isArray(value) && value.length > 0) n++;
        break;
      case "status":
        // El estado se muestra en los tabs, no cuenta como filtro
        break;
    }
  }
  return n;
}
