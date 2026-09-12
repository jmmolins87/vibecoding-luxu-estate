import { cache } from "react";
import {
  featuredProperties,
  newInMarketProperties,
} from "@/data/properties";
import type { Property, PropertyStatus } from "@/types/property";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const DEFAULT_PAGE_SIZE = 8;

export type PropertyStatusFilter = "all" | PropertyStatus;

interface PropertyRow {
  id: string;
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
  image: string;
  image_alt: string;
  tag: Property["tag"] | null;
  featured: boolean;
}

function mapRowToProperty(row: PropertyRow): Property {
  return {
    id: row.id,
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
    image: row.image,
    imageAlt: row.image_alt,
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
  fromSupabase: boolean;
}

function paginateLocal(
  page: number,
  pageSize: number,
  status: PropertyStatusFilter,
): PaginatedProperties {
  const filtered =
    status === "all"
      ? newInMarketProperties
      : newInMarketProperties.filter((p) => p.status === status);
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
    status,
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
  async (options?: {
    page?: number;
    pageSize?: number;
    status?: PropertyStatusFilter;
  }): Promise<PaginatedProperties> => {
    const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
    const status = options?.status ?? "all";
    const requestedPage = options?.page ?? 1;

    const supabase = createServerSupabaseClient();
    if (!supabase) return paginateLocal(requestedPage, pageSize, status);

    // Primero el total para calcular totalPages (count exacto, sin traer filas)
    let countQuery = supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("featured", false);
    if (status !== "all") countQuery = countQuery.eq("status", status);

    const { count, error: countError } = await countQuery;
    if (countError || count === null) return paginateLocal(requestedPage, pageSize, status);

    const total = count;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, requestedPage), totalPages);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let dataQuery = supabase
      .from("properties")
      .select("*")
      .eq("featured", false)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (status !== "all") dataQuery = dataQuery.eq("status", status);

    const { data, error } = await dataQuery;
    if (error || !data) return paginateLocal(requestedPage, pageSize, status);

    return {
      properties: (data as PropertyRow[]).map(mapRowToProperty),
      total,
      totalPages,
      page,
      pageSize,
      status,
      fromSupabase: true,
    };
  },
);
