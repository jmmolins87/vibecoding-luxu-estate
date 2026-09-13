import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import PropertyGallery from "@/components/property/PropertyGallery";
import AgentCard from "@/components/property/AgentCard";
import FeaturesGrid from "@/components/property/FeaturesGrid";
import AboutSection from "@/components/property/AboutSection";
import AmenitiesList from "@/components/property/AmenitiesList";
import MortgageEstimate from "@/components/property/MortgageEstimate";
import PropertyMapWrapper from "@/components/property/PropertyMapWrapper";
import Icon from "@/components/ui/Icon";
import { getAllPropertySlugs, getPropertyBySlug } from "@/lib/properties";
import { formatPrice } from "@/types/property";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, createTranslator } from "@/lib/i18n/dictionaries";

/** ISR: las fichas se regeneran cada 60 s (best-practices §1). */
export const revalidate = 60;

// NOTA: este segmento NO lleva `loading.tsx` a propósito.
// Bug conocido de Next 16 (issues #76474, #93008, #93239): con `loading.tsx`
// el streaming vacía las cabeceras con 200 antes de que el boundary capture
// `notFound()`, y los slugs inexistentes devuelven HTTP 200 (soft-404: malo
// para SEO). Sin `loading.tsx`, `notFound()` devuelve un 404 real.
// El mapa sigue teniendo su propio skeleton vía `dynamic(..., { loading })`.

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [property, locale] = await Promise.all([getPropertyBySlug(slug), getLocale()]);
  const t = createTranslator(getDictionary(locale));

  // Metatags genéricos si el slug no existe — nunca vacíos (§4.1).
  if (!property) return { title: `${t("property.notFound")} | LuxeEstate` };

  const title = `${property.title} — ${formatPrice(property, locale)}`;
  const description =
    `${property.type} ${property.status === "sale" ? t("property.forSale") : t("property.forRent")} in ${property.location}: ` +
    `${property.beds} beds, ${property.baths} baths, ${property.area} m².`;

  return {
    title: `${title} | LuxeEstate`,
    description,
    alternates: { canonical: `/property/${property.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/property/${property.slug}`,
      images: [
        {
          url: property.images[0],
          width: 1200,
          height: 630,
          alt: property.imagesAlt[0],
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [property.images[0]],
    },
  };
}

/**
 * Server Component: ficha de propiedad individual.
 * Solo el mapa, la galería y los widgets interactivos son client islands.
 */
export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [property, locale] = await Promise.all([getPropertyBySlug(slug), getLocale()]);
  const dict = getDictionary(locale);
  const t = createTranslator(dict);

  if (!property) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.location,
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "USD",
    },
    numberOfBedrooms: property.beds,
    image: property.images,
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.coordinates.lat,
      longitude: property.coordinates.lng,
    },
  };

  return (
    <div className="min-h-full bg-clearday font-display text-nordic antialiased selection:bg-mosque selection:text-white dark:bg-[#0f231f] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <PropertyGallery property={property} />
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <AgentCard property={property} />
              <div className="rounded-xl border border-mosque/5 bg-white p-2 shadow-sm dark:bg-white/5">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-nordic/5">
                  <PropertyMapWrapper
                    lat={property.coordinates.lat}
                    lng={property.coordinates.lng}
                    title={property.title}
                  />
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${property.coordinates.lat}&mlon=${property.coordinates.lng}#map=15/${property.coordinates.lat}/${property.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-end gap-1 px-2 pb-1 text-xs font-medium text-nordic/60 hover:text-mosque"
                >
                  <Icon name="place" className="h-3.5 w-3.5" />
                  {t("property.viewOnMap")}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="-mt-0 space-y-8 lg:col-span-8">
            <FeaturesGrid property={property} />
            <AboutSection description={property.description} />
            <AmenitiesList amenities={property.amenities} />
            <MortgageEstimate
              price={property.price}
              isRent={property.status === "rent"}
              priceSuffix={property.priceSuffix}
            />
          </div>
        </div>
      </main>
      <footer className="mt-12 border-t border-slate-200 bg-white py-12 dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="text-sm text-nordic/50 dark:text-gray-400">
            {t("footer.rights", { year: 2026 })}
          </div>
        </div>
      </footer>
    </div>
  );
}
