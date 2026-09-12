import PropertyCard from "@/components/home/PropertyCard";
import MarketTabs from "@/components/home/MarketTabs";
import MarketPagination from "@/components/home/MarketPagination";
import type { PaginatedProperties } from "@/lib/properties";

/**
 * Sección "New in Market" renderizada en el SERVIDOR.
 * Los datos ya vienen paginados desde Supabase (range + count exacto);
 * la navegación entre páginas y filtros usa Links con ?page= / ?status=,
 * así que cada cambio lo resuelve el Server Component de la página.
 */
export default function MarketSection({ data }: { data: PaginatedProperties }) {
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
        <MarketTabs active={data.status} />
      </div>

      {data.properties.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-nordic-muted dark:bg-white/5">
          No hay propiedades para este filtro.
        </p>
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
      />
    </section>
  );
}
