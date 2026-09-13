"use client";

import Icon from "@/components/ui/Icon";
import type { Property } from "@/types/property";
import FeaturedCard from "@/components/home/FeaturedCard";
import { useTranslations } from "@/lib/i18n/client";

export default function FeaturedCollections({
  properties,
}: {
  properties: Property[];
}) {
  const { t } = useTranslations();
  return (
    <section className="mb-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-light text-nordic dark:text-white">
            {t("featured.title")}
          </h2>
          <p className="mt-1 text-sm text-nordic-muted">
            {t("featured.subtitle")}
          </p>
        </div>
        <a
          href="#"
          className="hidden items-center gap-1 text-sm font-medium text-mosque transition-opacity hover:opacity-70 sm:flex"
        >
          {t("featured.viewAll")} <Icon name="arrow" className="h-4 w-4" />
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
