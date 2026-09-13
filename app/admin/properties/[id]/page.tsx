import { notFound } from "next/navigation";
import PropertyForm from "@/components/admin/PropertyForm";
import { PROPERTY_AMENITIES } from "@/lib/amenities";
import { getAdminPropertyById } from "@/lib/actions/admin";
import { withMinDuration } from "@/lib/delay";
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
  const property = await withMinDuration(getAdminPropertyById(id));
  if (!property) notFound();

  return (
    <PropertyForm
      initial={property}
      propertyId={id}
      labels={{
        breadcrumbProperties: t("admin.properties"),
        breadcrumbNew: t("admin.form.breadcrumbNew"),
        breadcrumbEdit: t("admin.form.breadcrumbEdit"),
        addTitle: t("admin.form.addTitle"),
        editTitle: t("admin.form.editTitle"),
        subtitle: t("admin.form.subtitle"),
        saveProperty: t("admin.form.saveProperty"),
        basicInfo: t("admin.form.basicInfo"),
        title: t("admin.form.title"),
        titlePh: t("admin.form.titlePh"),
        price: t("admin.form.price"),
        pricePh: t("admin.form.pricePh"),
        status: t("admin.form.status"),
        sale: t("admin.form.sale"),
        rent: t("admin.form.rent"),
        sold: t("admin.sold"),
        type: t("admin.form.type"),
        typeHouse: t("propertyType.House"),
        typeApartment: t("propertyType.Apartment"),
        typeVilla: t("propertyType.Villa"),
        typePenthouse: t("propertyType.Penthouse"),
        description: t("admin.form.description"),
        descriptionPh: t("admin.form.descriptionPh"),
        characters: t("admin.form.characters"),
        gallery: t("admin.form.gallery"),
        locationT: t("admin.form.locationT"),
        address: t("admin.form.address"),
        addressPh: t("admin.form.addressPh"),
        city: t("admin.form.location"),
        cityPh: t("admin.form.cityPh"),
        mapPreview: t("admin.form.mapPreview"),
        locating: t("admin.form.locating"),
        details: t("admin.form.details"),
        area: t("admin.form.area"),
        yearBuilt: t("admin.form.yearBuilt"),
        yearPh: t("admin.form.yearPh"),
        bedrooms: t("admin.form.bedrooms"),
        bathrooms: t("admin.form.bathrooms"),
        parking: t("admin.form.parking"),
        decrease: t("admin.form.decrease"),
        increase: t("admin.form.increase"),
        amenitiesTitle: t("admin.form.amenitiesTitle"),
        amenities: t("admin.form.amenities"),
        amenitiesHelp: t("admin.form.amenitiesHelp"),
        amenityOptions: PROPERTY_AMENITIES.map((value) => ({
          value,
          label: t(`amenity.${value}`),
        })),
        tag: t("admin.form.tag"),
        tagNone: t("admin.form.tagNone"),
        tagExclusive: t("tag.Exclusive"),
        tagNewArrival: t("tag.New Arrival"),
        tagPremium: t("tag.Premium"),
        tagNew: t("tag.New"),
        priceSuffix: t("admin.form.priceSuffix"),
        priceSuffixHelp: t("admin.form.priceSuffixHelp"),
        featuredLabel: t("admin.form.featuredLabel"),
        lat: t("admin.form.lat"),
        lng: t("admin.form.lng"),
        dropTitle: t("admin.form.dropTitle"),
        dropHint: t("admin.form.dropHint"),
        formats: t("admin.form.formats"),
        main: t("admin.form.main"),
        deleteImage: t("admin.form.deleteImage"),
        setMain: t("admin.form.setMain"),
        addMore: t("admin.form.addMore"),
        invalidType: t("admin.form.invalidType"),
        tooLarge: t("admin.form.tooLarge"),
        uploadFailed: t("admin.errorDefault"),
        cancel: t("admin.cancel"),
        saving: t("admin.saving"),
        deleteLabel: t("admin.delete"),
        deleting: t("admin.deleting"),
        confirmDelete: t("admin.confirmDelete"),
        propertyDeleted: t("admin.propertyDeleted"),
        imageRequired: t("admin.form.imageRequired"),
        propertyCreated: t("admin.propertyCreated"),
        propertyUpdated: t("admin.propertyUpdated"),
        errorDefault: t("admin.errorDefault"),
      }}
    />
  );
}
