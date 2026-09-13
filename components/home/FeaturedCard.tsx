"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import SaveButton from "@/components/home/SaveButton";
import { formatPrice, type Property } from "@/types/property";
import { useTranslations, useLocale } from "@/lib/i18n/client";

interface FeaturedCardProps {
  property: Property;
}

export default function FeaturedCard({ property }: FeaturedCardProps) {
  const { t } = useTranslations();
  const locale = useLocale();
  return (
    <Link
      href={`/property/${property.slug}`}
      className="group relative block cursor-pointer overflow-hidden rounded-xl bg-white shadow-soft dark:bg-white/5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          alt={property.imagesAlt[0]}
          src={property.images[0]}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {property.tag && (
          <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-wider text-nordic uppercase backdrop-blur-sm dark:bg-black/80 dark:text-white">
            {t(`tag.${property.tag}` as string) !== `tag.${property.tag}` ? t(`tag.${property.tag}` as string) : property.tag}
          </div>
        )}
        <SaveButton propertyId={property.id} className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-nordic backdrop-blur-sm transition-all hover:bg-mosque hover:text-white dark:bg-black/60 dark:text-white" />
        <div
          className={
            property.status === "rent"
              ? "absolute bottom-4 left-4 rounded bg-mosque/90 px-3 py-1.5 text-xs font-bold tracking-wider text-white shadow-md"
              : "absolute bottom-4 left-4 rounded bg-nordic/90 px-3 py-1.5 text-xs font-bold tracking-wider text-white shadow-md"
          }
        >
          {property.status === "rent" ? t("propertyCard.forRent") : t("propertyCard.forSale")}
        </div>
        {property.id === "glass-pavilion" && (
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
        )}
      </div>

      <div className="relative p-6">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-medium text-nordic transition-colors group-hover:text-mosque dark:text-white">
              {property.title}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-nordic-muted">
              <Icon name="place" className="h-4 w-4" /> {property.location}
            </p>
          </div>
          <span className="text-xl font-semibold text-mosque">
            {formatPrice(property, locale)}
          </span>
        </div>
        <div className="mt-6 flex items-center gap-6 border-t border-nordic/5 pt-6 dark:border-white/10">
          <div className="flex items-center gap-2 text-sm text-nordic-muted">
            <Icon name="bed" className="h-5 w-5" /> {property.beds} {t("featured.beds")}
          </div>
          <div className="flex items-center gap-2 text-sm text-nordic-muted">
            <Icon name="bath" className="h-5 w-5" /> {property.baths} {t("featured.baths")}
          </div>
          <div className="flex items-center gap-2 text-sm text-nordic-muted">
            <Icon name="area" className="h-5 w-5" /> {property.area.toLocaleString(locale)} m²
          </div>
        </div>
      </div>
    </Link>
  );
}
