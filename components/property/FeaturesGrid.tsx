"use client";

import Icon from "@/components/ui/Icon";
import type { Property } from "@/types/property";
import { useTranslations } from "@/lib/i18n/client";

interface FeaturesGridProps {
  property: Pick<Property, "area" | "beds" | "baths" | "garage">;
}

/** Server Component: grid de características (m², habs, baños, garage). */
export default function FeaturesGrid({ property }: FeaturesGridProps) {
  const { t } = useTranslations();
  const features = [
    { icon: "area" as const, value: String(property.area), label: t("property.squareMeters") },
    { icon: "bed" as const, value: String(property.beds), label: t("property.bedrooms") },
    { icon: "bath" as const, value: String(property.baths), label: t("property.bathrooms") },
    { icon: "garage" as const, value: String(property.garage), label: t("property.garage") },
  ];

  return (
    <section className="rounded-xl border border-mosque/5 bg-white p-8 shadow-sm dark:bg-white/5">
      <h2 className="mb-6 text-lg font-semibold text-nordic dark:text-white">
        {t("property.features")}
      </h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.label}
            className="flex flex-col items-center justify-center rounded-lg border border-mosque/10 bg-mosque/5 p-4"
          >
            <Icon name={f.icon} className="mb-2 h-6 w-6 text-mosque" />
            <span className="text-xl font-bold text-nordic dark:text-white">
              {f.value}
            </span>
            <span className="text-xs tracking-wider text-nordic/50 uppercase dark:text-gray-400">
              {f.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
