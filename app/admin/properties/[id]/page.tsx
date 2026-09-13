import { notFound } from "next/navigation";
import PropertyForm from "@/components/admin/PropertyForm";
import { getAdminPropertyById } from "@/lib/actions/admin";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator, getDictionary } from "@/lib/i18n/dictionaries";

export default async function AdminEditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const t = createTranslator(getDictionary(locale));
  const property = await getAdminPropertyById(id);
  if (!property) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{t("admin.editProperty")}</h1>
      <p className="mt-1 mb-6 font-mono text-xs text-nordic/50 dark:text-gray-400">{id}</p>
      <div className="rounded-2xl border border-nordic/10 bg-white p-5 shadow-soft sm:p-6 dark:border-white/10 dark:bg-white/5">
        <PropertyForm
          initial={property}
          propertyId={id}
          labels={{
            id: t("admin.form.id"),
            idHelp: t("admin.form.idHelp"),
            title: t("admin.form.title"),
            location: t("admin.form.location"),
            address: t("admin.form.address"),
            price: t("admin.form.price"),
            priceSuffix: t("admin.form.priceSuffix"),
            priceSuffixHelp: t("admin.form.priceSuffixHelp"),
            type: t("admin.form.type"),
            typeHouse: t("propertyType.House"),
            typeApartment: t("propertyType.Apartment"),
            typeVilla: t("propertyType.Villa"),
            typePenthouse: t("propertyType.Penthouse"),
            status: t("admin.form.status"),
            sale: t("admin.form.sale"),
            rent: t("admin.form.rent"),
            beds: t("admin.form.beds"),
            baths: t("admin.form.baths"),
            area: t("admin.form.area"),
            garage: t("admin.form.garage"),
            image: t("admin.form.image"),
            imageAlt: t("admin.form.imageAlt"),
            tag: t("admin.form.tag"),
            tagNone: t("admin.form.tagNone"),
            tagExclusive: t("tag.Exclusive"),
            tagNewArrival: t("tag.New Arrival"),
            tagPremium: t("tag.Premium"),
            tagNew: t("tag.New"),
            featuredLabel: t("admin.form.featuredLabel"),
            slug: t("admin.form.slug"),
            slugHelp: t("admin.form.slugHelp"),
            description: t("admin.form.description"),
            amenities: t("admin.form.amenities"),
            amenitiesHelp: t("admin.form.amenitiesHelp"),
            lat: t("admin.form.lat"),
            lng: t("admin.form.lng"),
            extraImages: t("admin.form.extraImages"),
            extraImagesHelp: t("admin.form.extraImagesHelp"),
            save: t("admin.save"),
            create: t("admin.create"),
            cancel: t("admin.cancel"),
            saving: t("admin.saving"),
            errorDefault: t("admin.errorDefault"),
          }}
        />
      </div>
    </div>
  );
}
