import HomeScreen from "@/components/home/HomeScreen";
import {
  DEFAULT_PAGE_SIZE,
  getFeaturedProperties,
  getPaginatedProperties,
} from "@/lib/properties";
import { parseFilters } from "@/lib/filters";

interface HomeSearchParams {
  page?: string;
  status?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  beds?: string;
  baths?: string;
  type?: string;
  amenities?: string;
}

/**
 * Búsqueda y paginación DEL LADO DEL SERVIDOR:
 * - Lee todos los filtros de los searchParams (fuente única de verdad).
 * - Obtiene solo la página pedida desde Supabase (`range` + `count` exacto).
 * - Cada navegación (`Link` a `/?page=N&...`) re-renderiza en el servidor.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;
  const page = Number.parseInt(params.page ?? "1", 10);
  const filters = parseFilters(
    params as Record<string, string | undefined>,
  );

  const [{ properties: featured }, market] = await Promise.all([
    getFeaturedProperties(),
    getPaginatedProperties({
      page: Number.isFinite(page) ? page : 1,
      pageSize: DEFAULT_PAGE_SIZE,
      ...filters,
    }),
  ]);

  return <HomeScreen featured={featured} market={market} filters={filters} />;
}
