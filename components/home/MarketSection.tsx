import Link from "next/link";
import PropertyCard from "@/components/home/PropertyCard";
import MarketTabs from "@/components/home/MarketTabs";
import MarketPagination from "@/components/home/MarketPagination";
import type { PaginatedProperties } from "@/lib/properties";
import type { PropertyFilters } from "@/lib/filters";

/**
 * Sección "New in Market" renderizada en el SERVIDOR.
 * Los datos ya vienen filtrados y paginados desde Supabase;
 * la navegación entre páginas y filtros usa Links con searchParams,
 * así que cada cambio lo resuelve el Server Component de la página.
 */
export default function MarketSection({
  data,
  filters,
}: {
  data: PaginatedProperties;
  filters: PropertyFilters;
}) {
  return (
    <section id="market" className="scroll-mt-24">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-light text-nordic dark:text-white">
            New in Market
          </h2>
          <p className="mt-1 text-sm text-nordic-muted">
            Fresh opportunities added this week.
          </p>
        </div>
        <MarketTabs active={data.status} filters={filters} />
      </div>

      {data.properties.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center dark:bg-white/5">
          <p className="text-sm font-medium text-nordic dark:text-white">
            No properties match these filters.
          </p>
          <Link
            href="/#market"
            className="mt-2 inline-block text-sm font-semibold text-mosque hover:underline"
          >
            Clear all filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      <MarketPagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        status={data.status}
        filters={filters}
      />
    </section>
  );
}
