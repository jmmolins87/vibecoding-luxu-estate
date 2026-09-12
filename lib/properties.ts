import { cache } from "react";
import {
  featuredProperties,
  newInMarketProperties,
} from "@/data/properties";
import type { Property, PropertyStatus } from "@/types/property";
import type { PropertyFilters } from "@/lib/filters";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const DEFAULT_PAGE_SIZE = 8;

export type PropertyStatusFilter = "all" | PropertyStatus;

interface PropertyRow {
  id: string;
  slug?: string | null;
  title: string;
  location: string;
  address: string;
  price: number | string;
  price_suffix: string | null;
  type: Property["type"];
  status: Property["status"];
  beds: number;
  baths: number | string;
  area: number | string;
  garage?: number | string | null;
  images?: string[] | null;
  images_alt?: string[] | null;
  description?: string | null;
  amenities?: string[] | null;
  agent?: Property["agent"] | null;
  lat?: number | string | null;
  lng?: number | string | null;
  tag: Property["tag"] | null;
  featured: boolean;
}

function mapRowToProperty(row: PropertyRow): Property {
  // Solo arrays: la foto principal es siempre `images[0]`.
  const images = row.images && row.images.length > 0 ? row.images : [];
  const imagesAlt =
    row.images_alt && row.images_alt.length > 0
      ? row.images_alt
      : images.map((_, i) => `${row.title} — photo ${i + 1}`);
  const lat = row.lat === null || row.lat === undefined ? 0 : Number(row.lat);
  const lng = row.lng === null || row.lng === undefined ? 0 : Number(row.lng);

  return {
    id: row.id,
    slug: row.slug ?? row.id,
    title: row.title,
    location: row.location,
    address: row.address,
    price: Number(row.price),
    ...(row.price_suffix ? { priceSuffix: row.price_suffix } : {}),
    type: row.type,
    status: row.status,
    beds: Number(row.beds),
    baths: Number(row.baths),
    area: Number(row.area),
    garage: row.garage === null || row.garage === undefined ? 0 : Number(row.garage),
    images,
    imagesAlt,
    description: row.description ?? "",
    amenities: row.amenities ?? [],
    agent: row.agent ?? {
      name: "LuxeEstate Advisor",
      photo: "",
      rating: "Verified Agent",
      phone: "",
      whatsapp: "",
    },
    coordinates: { lat, lng },
    ...(row.tag ? { tag: row.tag } : {}),
    ...(row.featured ? { featured: true } : {}),
  };
}

export interface PaginatedProperties {
  properties: Property[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  status: PropertyStatusFilter;
  filters: PropertyFilters;
  fromSupabase: boolean;
}

/** Aplica los filtros de búsqueda sobre datos locales (fallback sin Supabase). */
function applyLocalFilters(
  list: Property[],
  filters: PropertyFilters,
): Property[] {
  const q = filters.city?.trim().toLowerCase();
  return list.filter((p) => {
    if (
      filters.status &&
      filters.status !== "all" &&
      p.status !== filters.status
    )
      return false;
    if (q && !`${p.location} ${p.address} ${p.title}`.toLowerCase().includes(q))
      return false;
    if (filters.minPrice !== undefined && p.price < filters.minPrice)
      return false;
    if (filters.maxPrice !== undefined && p.price > filters.maxPrice)
      return false;
    if (filters.beds !== undefined && p.beds < filters.beds) return false;
    if (filters.baths !== undefined && p.baths < filters.baths) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (
      filters.amenities &&
      filters.amenities.length > 0 &&
      !filters.amenities.every((a) => p.amenities.includes(a))
    )
      return false;
    return true;
  });
}

function paginateLocal(
  page: number,
  pageSize: number,
  filters: PropertyFilters,
): PaginatedProperties {
  const filtered = applyLocalFilters(newInMarketProperties, {
    ...filters,
    status: filters.status ?? "all",
  });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    properties: filtered.slice(start, start + pageSize),
    total,
    totalPages,
    page: safePage,
    pageSize,
    status: filters.status ?? "all",
    filters,
    fromSupabase: false,
  };
}

/**
 * Lee las destacadas en el SERVIDOR (Server Component).
 * Si no hay credenciales de Supabase, usa los datos locales.
 */
export const getFeaturedProperties = cache(
  async (): Promise<{ properties: Property[]; fromSupabase: boolean }> => {
    const supabase = createServerSupabaseClient();
    if (!supabase) return { properties: featuredProperties, fromSupabase: false };

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("featured", true)
      .order("created_at", { ascending: false });

    if (error || !data) return { properties: featuredProperties, fromSupabase: false };

    return { properties: (data as PropertyRow[]).map(mapRowToProperty), fromSupabase: true };
  },
);

/**
 * Paginación DEL LADO DEL SERVIDOR con Supabase.
 * Usa `range()` + `count: exact` para no traer toda la tabla.
 * Debe llamarse desde Server Components / Server Actions / Route Handlers.
 */
export const getPaginatedProperties = cache(
  async (
    options?: {
      page?: number;
      pageSize?: number;
      status?: PropertyStatusFilter;
    } & PropertyFilters,
  ): Promise<PaginatedProperties> => {
    const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
    const status = options?.status ?? "all";
    const requestedPage = options?.page ?? 1;
    const filters: PropertyFilters = {
      city: options?.city,
      minPrice: options?.minPrice,
      maxPrice: options?.maxPrice,
      beds: options?.beds,
      baths: options?.baths,
      type: options?.type,
      amenities: options?.amenities,
      status,
    };

    const supabase = createServerSupabaseClient();
    if (!supabase) return paginateLocal(requestedPage, pageSize, filters);

    // Aplica los mismos filtros al count y a la query de datos.
    const buildFiltered = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      base: any,
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = base;
      const entries = Object.entries(filters) as [
        keyof PropertyFilters,
        unknown,
      ][];
      for (const [key, value] of entries) {
        switch (key) {
          case "status":
            if (value !== "all") q = q.eq("status", value);
            break;
          case "city":
            if (typeof value === "string" && value.trim() !== "") {
              const like = `%${value.trim()}%`;
              q = q.or(`location.ilike.${like},address.ilike.${like}`);
            }
            break;
          case "minPrice":
            if (typeof value === "number") q = q.gte("price", value);
            break;
          case "maxPrice":
            if (typeof value === "number") q = q.lte("price", value);
            break;
          case "beds":
            if (typeof value === "number") q = q.gte("beds", value);
            break;
          case "baths":
            if (typeof value === "number") q = q.gte("baths", value);
            break;
          case "type":
            if (typeof value === "string" && value !== "")
              q = q.eq("type", value);
            break;
          case "amenities":
            if (Array.isArray(value) && value.length > 0)
              q = q.contains("amenities", value);
            break;
        }
      }
      return q;
    };

    // Primero el total para calcular totalPages (count exacto, sin traer filas)
    const countBase = supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("featured", false);
    const { count, error: countError } = await buildFiltered(countBase);
    if (countError || count === null)
      return paginateLocal(requestedPage, pageSize, filters);

    const total = count;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, requestedPage), totalPages);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const dataBase = supabase
      .from("properties")
      .select("*")
      .eq("featured", false)
      .order("created_at", { ascending: false })
      .range(from, to);
    const { data, error } = await buildFiltered(dataBase);
    if (error || !data) return paginateLocal(requestedPage, pageSize, filters);

    return {
      properties: (data as PropertyRow[]).map((row) =>
        completeWithLocal(row, mapRowToProperty(row)),
      ),
      total,
      totalPages,
      page,
      pageSize,
      status,
      filters,
      fromSupabase: true,
    };
  },
);

function findLocalBySlug(slug: string): Property | null {
  const all = [...featuredProperties, ...newInMarketProperties];
  return (
    all.find((p) => p.slug === slug || p.id === slug) ?? null
  );
}

/**
 * Completa los campos que la fila de Supabase aún no trae (BD sin migrar)
 * con los datos locales. Cuando la migración 003 esté aplicada, la BD manda.
 */
function completeWithLocal(row: PropertyRow, mapped: Property): Property {
  const local = findLocalBySlug(row.id);
  if (!local) return mapped;

  return {
    ...mapped,
    slug: row.slug ?? local.slug,
    garage:
      row.garage === null || row.garage === undefined
        ? local.garage
        : mapped.garage,
    images: row.images && row.images.length > 0 ? mapped.images : local.images,
    imagesAlt:
      row.images && row.images.length > 0 ? mapped.imagesAlt : local.imagesAlt,
    description: row.description || local.description,
    amenities:
      row.amenities && row.amenities.length > 0
        ? mapped.amenities
        : local.amenities,
    agent: row.agent?.name ? mapped.agent : local.agent,
    coordinates:
      row.lat === null ||
      row.lat === undefined ||
      row.lng === null ||
      row.lng === undefined
        ? local.coordinates
        : mapped.coordinates,
  };
}

/**
 * Lee UNA propiedad por SLUG en el SERVIDOR (Server Component).
 * Busca primero en Supabase (columna `slug`); si no hay credenciales
 * o falla, usa los datos locales. Acepta `id` como fallback.
 */
export const getPropertyBySlug = cache(
  async (slug: string): Promise<Property | null> => {
    const supabase = createServerSupabaseClient();
    if (!supabase) return findLocalBySlug(slug);

    // Intento por slug; si la columna aún no existe en BD, cae al fallback.
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      const row = data as PropertyRow;
      return completeWithLocal(row, mapRowToProperty(row));
    }

    // Fallback por id (BD sin columna slug) y luego datos locales.
    const byId = await supabase
      .from("properties")
      .select("*")
      .eq("id", slug)
      .maybeSingle();
    if (!byId.error && byId.data) {
      const row = byId.data as PropertyRow;
      return completeWithLocal(row, mapRowToProperty(row));
    }

    return findLocalBySlug(slug);
  },
);

/**
 * Slugs para `generateStaticParams` de la página de detalle.
 * Sin Supabase devuelve los slugs locales (build seguro).
 */
export const getAllPropertySlugs = cache(async (): Promise<string[]> => {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return [...featuredProperties, ...newInMarketProperties].map((p) => p.slug);
  }

  const { data, error } = await supabase.from("properties").select("slug, id");
  if (error || !data) {
    return [...featuredProperties, ...newInMarketProperties].map((p) => p.slug);
  }

  return (data as { slug?: string | null; id: string }[]).map(
    (r) => r.slug ?? r.id,
  );
});
