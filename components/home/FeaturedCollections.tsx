import Icon from "@/components/ui/Icon";
import { featuredProperties } from "@/data/properties";
import type { Property } from "@/types/property";
import FeaturedCard from "@/components/home/FeaturedCard";

export default function FeaturedCollections({
  properties = featuredProperties,
}: {
  properties?: Property[];
}) {
  return (
    <section className="mb-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-light text-nordic dark:text-white">
            Featured Collections
          </h2>
          <p className="mt-1 text-sm text-nordic-muted">
            Curated properties for the discerning eye.
          </p>
        </div>
        <a
          href="#"
          className="hidden items-center gap-1 text-sm font-medium text-mosque transition-opacity hover:opacity-70 sm:flex"
        >
          View all <Icon name="arrow" className="h-4 w-4" />
        </a>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {properties.map((property) => (
          <FeaturedCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
