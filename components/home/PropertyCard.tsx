import Link from "next/link";
import Icon from "@/components/ui/Icon";
import SaveButton from "@/components/home/SaveButton";
import { formatPrice, type Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const isRent = property.status === "rent";

  return (
    <Link
      href={`/property/${property.slug}`}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-card transition-all duration-300 hover:shadow-soft dark:bg-white/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          alt={property.imagesAlt[0]}
          src={property.images[0]}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <SaveButton className="absolute top-3 right-3 rounded-full bg-white/90 p-2 text-nordic transition-colors hover:bg-mosque hover:text-white dark:bg-black/50 dark:text-white" />
        <div
          className={
            isRent
              ? "absolute bottom-3 left-3 rounded bg-mosque/90 px-2 py-1 text-xs font-bold text-white"
              : "absolute bottom-3 left-3 rounded bg-nordic/90 px-2 py-1 text-xs font-bold text-white"
          }
        >
          {isRent ? "FOR RENT" : "FOR SALE"}
        </div>
      </div>

      <div className="flex flex-grow flex-col p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-lg font-bold text-nordic dark:text-white">
            {formatPrice(property)}
            {property.priceSuffix && (
              <span className="text-sm font-normal text-nordic-muted">
                {property.priceSuffix}
              </span>
            )}
          </h3>
        </div>
        <h4 className="mb-1 truncate font-medium text-nordic dark:text-gray-200">
          {property.title}
        </h4>
        <p className="mb-4 text-xs text-nordic-muted">{property.address}</p>
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/10">
          <div className="flex items-center gap-1 text-xs text-nordic-muted">
            <Icon name="bed" className="h-4 w-4 text-mosque/80" /> {property.beds}
          </div>
          <div className="flex items-center gap-1 text-xs text-nordic-muted">
            <Icon name="bath" className="h-4 w-4 text-mosque/80" /> {property.baths}
          </div>
          <div className="flex items-center gap-1 text-xs text-nordic-muted">
            <Icon name="area" className="h-4 w-4 text-mosque/80" /> {property.area}m²
          </div>
        </div>
      </div>
    </Link>
  );
}
