import Navbar from "@/components/layout/Navbar";
import HeroSearch from "@/components/home/HeroSearch";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import MarketSection from "@/components/home/MarketSection";
import type { PaginatedProperties } from "@/lib/properties";
import type { PropertyFilters } from "@/lib/filters";
import type { Property } from "@/types/property";

interface HomeScreenProps {
  featured: Property[];
  market: PaginatedProperties;
  filters: PropertyFilters;
}

/**
 * Server Component: recibe los datos ya paginados desde `app/page.tsx`
 * (que los obtiene en el servidor con Supabase). No hace fetch en cliente.
 */
export default function HomeScreen({ featured, market, filters }: HomeScreenProps) {
  return (
    <div className="min-h-full bg-clearday font-display text-nordic antialiased selection:bg-mosque selection:text-white dark:bg-[#0f231f] dark:text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <HeroSearch filters={filters} total={market.total} />
        {featured.length > 0 && <FeaturedCollections properties={featured} />}
        <MarketSection data={market} filters={filters} />
      </main>
    </div>
  );
}
