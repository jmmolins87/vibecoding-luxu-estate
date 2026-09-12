import HomeScreen from "@/components/home/HomeScreen";
import {
  DEFAULT_PAGE_SIZE,
  getFeaturedProperties,
  getPaginatedProperties,
  type PropertyStatusFilter,
} from "@/lib/properties";

interface HomeSearchParams {
  page?: string;
  status?: string;
}

function parseStatus(value: string | undefined): PropertyStatusFilter {
  if (value === "sale" || value === "rent") return value;
  return "all";
}

/**
 * Paginación DEL LADO DEL SERVIDOR con funciones de Next.js:
 * - Lee `?page=` y `?status=` de los searchParams (Server Component).
 * - Obtiene solo la página pedida desde Supabase (`range` + `count` exacto).
 * - Cada navegación (`Link` a `/?page=N`) re-renderiza en el servidor.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;
  const page = Number.parseInt(params.page ?? "1", 10);
  const status = parseStatus(params.status);

  const [{ properties: featured }, market] = await Promise.all([
    getFeaturedProperties(),
    getPaginatedProperties({
      page: Number.isFinite(page) ? page : 1,
      pageSize: DEFAULT_PAGE_SIZE,
      status,
    }),
  ]);

  return <HomeScreen featured={featured} market={market} />;
}
