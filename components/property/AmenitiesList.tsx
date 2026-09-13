"use client";

import Icon from "@/components/ui/Icon";
import { useTranslations } from "@/lib/i18n/client";

interface AmenitiesListProps {
  amenities: string[];
}

/** Server Component: lista de amenities en 2 columnas. */
export default function AmenitiesList({ amenities }: AmenitiesListProps) {
  const { t } = useTranslations();
  if (amenities.length === 0) return null;

  return (
    <section className="rounded-xl border border-mosque/5 bg-white p-8 shadow-sm dark:bg-white/5">
      <h2 className="mb-6 text-lg font-semibold text-nordic dark:text-white">
        {t("property.amenities")}
      </h2>
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {amenities.map((amenity) => (
          <div
            key={amenity}
            className="flex items-center gap-3 text-nordic/70 dark:text-gray-300"
          >
            <Icon name="checkCircle" className="h-4 w-4 shrink-0 text-mosque/60" />
            <span>{amenity}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
