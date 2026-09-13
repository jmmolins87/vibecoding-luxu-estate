"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  createProperty,
  updateProperty,
  type AdminPropertyDetail,
  type PropertyFormInput,
} from "@/lib/actions/admin";
import { geocodeAddress } from "@/lib/actions/geocode";
import { useToast } from "@/components/ui/Toast";
import Icon, { type IconName } from "@/components/ui/Icon";
import CounterStepper from "@/components/admin/CounterStepper";
import GalleryUploader, {
  type GalleryUploaderLabels,
} from "@/components/admin/GalleryUploader";

export interface PropertyFormLabels extends GalleryUploaderLabels {
  breadcrumbProperties: string;
  breadcrumbNew: string;
  breadcrumbEdit: string;
  addTitle: string;
  editTitle: string;
  subtitle: string;
  saveProperty: string;
  basicInfo: string;
  title: string;
  titlePh: string;
  price: string;
  pricePh: string;
  status: string;
  sale: string;
  rent: string;
  sold: string;
  type: string;
  typeHouse: string;
  typeApartment: string;
  typeVilla: string;
  typePenthouse: string;
  description: string;
  descriptionPh: string;
  characters: string;
  gallery: string;
  locationT: string;
  address: string;
  addressPh: string;
  city: string;
  cityPh: string;
  mapPreview: string;
  locating: string;
  details: string;
  area: string;
  yearBuilt: string;
  yearPh: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  decrease: string;
  increase: string;
  amenitiesTitle: string;
  amenities: string;
  amenitiesHelp: string;
  amenityOptions: { value: string; label: string }[];
  tag: string;
  tagNone: string;
  tagExclusive: string;
  tagNewArrival: string;
  tagPremium: string;
  tagNew: string;
  priceSuffix: string;
  priceSuffixHelp: string;
  featuredLabel: string;
  lat: string;
  lng: string;
  cancel: string;
  saving: string;
  imageRequired: string;
  propertyCreated: string;
  propertyUpdated: string;
  errorDefault: string;
}

const inputCls =
  "w-full rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm text-nordic placeholder-gray-400 transition-all focus:border-mosque focus:ring-1 focus:ring-mosque outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500";

const labelCls = "mb-1.5 block text-sm font-medium text-nordic dark:text-gray-200";
const helpCls = "mt-1 text-xs text-nordic/50 dark:text-gray-500";



function SectionCard({
  icon,
  title,
  action,
  children,
}: {
  icon: IconName;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-3 border-b border-hint/30 bg-linear-to-r from-hint/10 to-transparent px-6 py-4 sm:px-8 sm:py-6 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hint text-nordic dark:text-nordic">
            <Icon name={icon} className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-nordic sm:text-xl dark:text-white">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="space-y-6 p-6 sm:p-8">{children}</div>
    </section>
  );
}

function emptyForm(): PropertyFormInput {
  return {
    id: "", title: "", location: "", address: "", price: 0, priceSuffix: "",
    type: "House", status: "sale", beds: 3, baths: 2, area: 100, garage: 1,
    yearBuilt: "", image: "", imageAlt: "", tag: "", featured: false, slug: "",
    description: "", amenities: "", lat: "", lng: "", extraImages: "",
  };
}

function toFormState(detail?: AdminPropertyDetail): PropertyFormInput {
  const base = emptyForm();
  if (!detail) return base;
  return {
    ...base,
    id: detail.id,
    title: detail.title,
    location: detail.location,
    address: detail.address,
    price: Number(detail.price),
    priceSuffix: detail.price_suffix ?? "",
    type: (["House", "Apartment", "Villa", "Penthouse"] as const).includes(detail.type as never)
      ? (detail.type as PropertyFormInput["type"])
      : "House",
    status: detail.status === "rent" || detail.status === "sold" ? detail.status : "sale",
    beds: Number(detail.beds),
    baths: Number(detail.baths),
    area: Number(detail.area),
    garage: Number(detail.garage ?? 0),
    yearBuilt: detail.year_built === null || detail.year_built === undefined ? "" : String(detail.year_built),
    image: detail.image,
    imageAlt: detail.image_alt ?? "",
    tag: detail.tag ?? "",
    featured: Boolean(detail.featured),
    slug: detail.slug ?? "",
    description: detail.description ?? "",
    amenities: (detail.amenities ?? []).join(", "),
    lat: detail.lat === null || detail.lat === undefined ? "" : String(detail.lat),
    lng: detail.lng === null || detail.lng === undefined ? "" : String(detail.lng),
    extraImages: (detail.images ?? []).slice(1).join("\n"),
  };
}

function initialImages(detail?: AdminPropertyDetail): string[] {
  if (!detail) return [];
  const fromArray = (detail.images ?? []).filter(Boolean);
  if (fromArray.length > 0) return fromArray;
  return detail.image ? [detail.image] : [];
}

function parseAmenityList(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

/** Muestra el precio con separadores de miles; 0 se muestra vacío. */
function formatPriceText(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

function parsePriceText(v: string): number {
  const clean = v.replace(/[^0-9.]/g, "");
  if (clean === "" || clean === ".") return 0;
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Formulario crear/editar propiedad (diseño `add_edit_property_form`):
 * cabecera con breadcrumb + Save Draft / Save Property, grid 8+4 con
 * Basic Information, Description, Gallery, Location, Details, Amenities
 * y tarjeta Publishing & SEO con los campos extra de la BD.
 * La galería sube al bucket `property-images` de Supabase.
 */
export default function PropertyForm({
  initial,
  propertyId,
  labels,
}: {
  initial?: AdminPropertyDetail;
  propertyId?: string;
  labels: PropertyFormLabels;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [form, setForm] = useState<PropertyFormInput>(() => toFormState(initial));
  const [images, setImages] = useState<string[]>(() => initialImages(initial));
  // Foto inicial serializada: los botones se habilitan solo si hay cambios.
  const [baseline] = useState(() => {
    const baseImages = initialImages(initial);
    return JSON.stringify({
      ...toFormState(initial),
      image: baseImages[0] ?? "",
      extraImages: baseImages.slice(1).join("\n"),
    });
  });
  const [priceText, setPriceText] = useState(() =>
    formatPriceText(Number(initial?.price ?? 0)),
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [locating, setLocating] = useState(false);
  const isEdit = Boolean(propertyId);
  // Dirección/ciudad iniciales: solo se geocodifica cuando el usuario las cambia.
  const initialGeoRef = useRef({
    address: (initial?.address ?? "").trim(),
    location: (initial?.location ?? "").trim(),
  });

  // Geocodifica dirección + ciudad (debounce) y centra el mapa.
  useEffect(() => {
    const addr = form.address.trim();
    const city = form.location.trim();
    if (
      addr === initialGeoRef.current.address &&
      city === initialGeoRef.current.location
    ) {
      return;
    }
    const query = [addr, city].filter(Boolean).join(", ");
    if (query.length < 4) return;
    const timer = setTimeout(() => {
      setLocating(true);
      void (async () => {
        try {
          const geo = await geocodeAddress(query);
          if (geo) {
            setForm((f) => ({ ...f, lat: String(geo.lat), lng: String(geo.lng) }));
          }
        } finally {
          setLocating(false);
        }
      })();
    }, 800);
    return () => clearTimeout(timer);
  }, [form.address, form.location]);

  function set<K extends keyof PropertyFormInput>(key: K, value: PropertyFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleAmenity(name: string) {
    const list = parseAmenityList(form.amenities);
    const next = list.includes(name)
      ? list.filter((a) => a !== name)
      : [...list, name];
    set("amenities", next.join(", "));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (images.length === 0) {
      setError(labels.imageRequired);
      return;
    }
    const payload: PropertyFormInput = {
      ...form,
      image: images[0],
      extraImages: images.slice(1).join("\n"),
    };
    startTransition(async () => {
      try {
        if (propertyId) {
          await updateProperty(propertyId, payload);
          notify(labels.propertyUpdated);
        } else {
          await createProperty(payload);
          notify(labels.propertyCreated);
        }
        router.push("/admin/properties");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : labels.errorDefault);
      }
    });
  }

  // Hay cambios si el estado actual difiere de la foto inicial
  // (la galería `images` manda sobre `image`/`extraImages` del form).
  const isDirty =
    JSON.stringify({
      ...form,
      image: images[0] ?? "",
      extraImages: images.slice(1).join("\n"),
    }) !== baseline;

  const amenityList = parseAmenityList(form.amenities);
  const canonicalValues = labels.amenityOptions.map((o) => o.value);
  const customAmenities = amenityList.filter((a) => !canonicalValues.includes(a));

  const latNum = Number(form.lat);
  const lngNum = Number(form.lng);
  const hasCoords =
    form.lat.trim() !== "" &&
    form.lng.trim() !== "" &&
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum);
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lngNum - 0.03}%2C${latNum - 0.03}%2C${lngNum + 0.03}%2C${latNum + 0.03}&layer=mapnik&marker=${latNum}%2C${lngNum}`
    : null;

  return (
    <div className="pb-20 md:pb-0">
      {/* Cabecera: breadcrumb + título + acciones */}
      <header className="mb-10 flex flex-col justify-between gap-6 border-b border-gray-200 pb-8 md:flex-row md:items-end dark:border-white/10">
        <div className="space-y-4">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/admin/properties" className="transition-colors hover:text-mosque dark:hover:text-hint">
                  {labels.breadcrumbProperties}
                </Link>
              </li>
              <li aria-hidden="true">
                <Icon name="arrow" className="h-3.5 w-3.5 text-gray-400" />
              </li>
              <li aria-current="page" className="text-nordic dark:text-white">
                {isEdit ? labels.breadcrumbEdit : labels.breadcrumbNew}
              </li>
            </ol>
          </nav>
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-nordic md:text-4xl dark:text-white">
              {isEdit ? labels.editTitle : labels.addTitle}
            </h1>
            <p className="max-w-2xl text-base font-normal text-gray-500 dark:text-gray-400">
              {labels.subtitle}
            </p>
          </div>
        </div>
        <div className="hidden gap-3 md:flex">
          <button
            type="submit"
            form="pf-form"
            disabled={isPending || !isDirty}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-mosque bg-transparent px-4 py-2.5 text-sm font-medium whitespace-nowrap text-mosque transition-colors hover:bg-mosque/5 focus:ring-2 focus:ring-mosque focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-[#0f231f]"
          >
            <Icon name="check" className="h-4 w-4" />
            {isPending ? labels.saving : labels.saveProperty}
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <form id="pf-form" onSubmit={handleSubmit} className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
        {/* Columna principal */}
        <div className="space-y-8 xl:col-span-8">
          <SectionCard icon="grid" title={labels.basicInfo}>
            <div>
              <label htmlFor="pf-title" className={labelCls}>
                {labels.title} <span className="text-red-500">*</span>
              </label>
              <input
                id="pf-title" required value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder={labels.titlePh} className={`${inputCls} text-base`}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label htmlFor="pf-price" className={labelCls}>
                  {labels.price} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400">$</span>
                  <input
                    id="pf-price" type="text" inputMode="decimal" required
                    value={priceText} placeholder={labels.pricePh}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (/^[0-9.,\s]*$/.test(raw)) {
                        setPriceText(raw);
                        set("price", parsePriceText(raw));
                      }
                    }}
                    onFocus={() => setPriceText(form.price ? String(form.price) : "")}
                    onBlur={() => setPriceText(formatPriceText(form.price))}
                    className={`${inputCls} pr-4 pl-7 text-base font-medium`}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="pf-status" className={labelCls}>{labels.status}</label>
                <select
                  id="pf-status" value={form.status}
                  onChange={(e) => set("status", e.target.value as PropertyFormInput["status"])}
                  className={`${inputCls} cursor-pointer text-base`}
                >
                  <option value="sale">{labels.sale}</option>
                  <option value="rent">{labels.rent}</option>
                  <option value="sold">{labels.sold}</option>
                </select>
              </div>
              <div>
                <label htmlFor="pf-type" className={labelCls}>{labels.type}</label>
                <select
                  id="pf-type" value={form.type}
                  onChange={(e) => set("type", e.target.value as PropertyFormInput["type"])}
                  className={`${inputCls} cursor-pointer text-base`}
                >
                  <option value="House">{labels.typeHouse}</option>
                  <option value="Apartment">{labels.typeApartment}</option>
                  <option value="Villa">{labels.typeVilla}</option>
                  <option value="Penthouse">{labels.typePenthouse}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label htmlFor="pf-priceSuffix" className={labelCls}>{labels.priceSuffix}</label>
                <input
                  id="pf-priceSuffix" value={form.priceSuffix}
                  onChange={(e) => set("priceSuffix", e.target.value)}
                  placeholder="/mo" className={`${inputCls} text-base`}
                />
                <p className={helpCls}>{labels.priceSuffixHelp}</p>
              </div>
              <div>
                <label htmlFor="pf-tag" className={labelCls}>{labels.tag}</label>
                <select
                  id="pf-tag" value={form.tag}
                  onChange={(e) => set("tag", e.target.value)}
                  className={`${inputCls} cursor-pointer text-base`}
                >
                  <option value="">{labels.tagNone}</option>
                  <option value="Exclusive">{labels.tagExclusive}</option>
                  <option value="New Arrival">{labels.tagNewArrival}</option>
                  <option value="Premium">{labels.tagPremium}</option>
                  <option value="New">{labels.tagNew}</option>
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label htmlFor="pf-featured" className="flex cursor-pointer items-center gap-2 text-sm font-medium text-nordic dark:text-gray-200">
                  <input
                    id="pf-featured" type="checkbox" checked={form.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                    className="h-4 w-4 accent-[#0e5f56]"
                  />
                  {labels.featuredLabel}
                </label>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon="edit" title={labels.description}>
            <div>
              <textarea
                id="pf-description" value={form.description}
                onChange={(e) => set("description", e.target.value.slice(0, 2000))}
                placeholder={labels.descriptionPh} rows={8}
                className={`${inputCls} min-h-50 resize-y text-base leading-relaxed`}
              />
              <div className="mt-2 text-right text-xs text-gray-400">
                {form.description.length} / 2000 {labels.characters}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon="grid"
            title={labels.gallery}
            action={
              <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
                {labels.formats}
              </span>
            }
          >
            <GalleryUploader images={images} onChange={setImages} labels={labels} />
          </SectionCard>
        </div>

        {/* Columna lateral */}
        <div className="space-y-8 xl:col-span-4">
          <SectionCard icon="place" title={labels.locationT}>
            <div>
              <label htmlFor="pf-address" className={labelCls}>{labels.address}</label>
              <input
                id="pf-address" value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder={labels.addressPh} className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="pf-location" className={labelCls}>{labels.city}</label>
              <input
                id="pf-location" value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder={labels.cityPh} className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pf-lat" className={labelCls}>{labels.lat}</label>
                <input
                  id="pf-lat" type="number" step="any" value={form.lat}
                  onChange={(e) => set("lat", e.target.value)} className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="pf-lng" className={labelCls}>{labels.lng}</label>
                <input
                  id="pf-lng" type="number" step="any" value={form.lng}
                  onChange={(e) => set("lng", e.target.value)} className={inputCls}
                />
              </div>
            </div>
            {mapSrc ? (
              <iframe
                title={labels.mapPreview}
                src={mapSrc}
                loading="lazy"
                className="h-48 w-full rounded-lg border border-gray-200 dark:border-white/10"
              />
            ) : (
              <div className="relative h-48 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-white/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center gap-1 rounded bg-white/90 px-3 py-1.5 text-xs font-bold text-nordic shadow-sm backdrop-blur-sm dark:bg-white/10 dark:text-white">
                    <Icon name="place" className="h-4 w-4 text-mosque dark:text-hint" />
                    {locating ? labels.locating : labels.mapPreview}
                  </span>
                </div>
              </div>
            )}
            {locating && mapSrc && (
              <p className={helpCls}>{labels.locating}</p>
            )}
          </SectionCard>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3 border-b border-hint/30 bg-gradient-to-r from-hint/10 to-transparent px-6 py-4 dark:border-white/5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hint text-nordic">
                <Icon name="area" className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-nordic dark:text-white">{labels.details}</h2>
            </div>
            <div className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pf-area" className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                    {labels.area}
                  </label>
                  <input
                    id="pf-area" type="number" min={0} step="any" value={form.area}
                    onChange={(e) => set("area", Number(e.target.value))}
                    placeholder="0"
                    className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm text-nordic transition-all outline-none focus:border-mosque focus:bg-white focus:ring-1 focus:ring-mosque dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/5"
                  />
                </div>
                <div>
                  <label htmlFor="pf-year" className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                    {labels.yearBuilt}
                  </label>
                  <input
                    id="pf-year" inputMode="numeric" value={form.yearBuilt}
                    onChange={(e) => set("yearBuilt", e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                    placeholder={labels.yearPh}
                    className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm text-nordic transition-all outline-none focus:border-mosque focus:bg-white focus:ring-1 focus:ring-mosque dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/5"
                  />
                </div>
              </div>

              <hr className="border-gray-100 dark:border-white/5" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="pf-beds" className="flex items-center gap-2 text-sm font-medium text-nordic dark:text-gray-200">
                    <Icon name="bed" className="h-4 w-4 text-gray-400" />
                    {labels.bedrooms}
                  </label>
                  <CounterStepper id="pf-beds" value={form.beds} onChange={(v) => set("beds", v)} decreaseLabel={labels.decrease} increaseLabel={labels.increase} />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="pf-baths" className="flex items-center gap-2 text-sm font-medium text-nordic dark:text-gray-200">
                    <Icon name="bath" className="h-4 w-4 text-gray-400" />
                    {labels.bathrooms}
                  </label>
                  <CounterStepper id="pf-baths" value={form.baths} onChange={(v) => set("baths", v)} decreaseLabel={labels.decrease} increaseLabel={labels.increase} />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="pf-garage" className="flex items-center gap-2 text-sm font-medium text-nordic dark:text-gray-200">
                    <Icon name="garage" className="h-4 w-4 text-gray-400" />
                    {labels.parking}
                  </label>
                  <CounterStepper id="pf-garage" value={form.garage} onChange={(v) => set("garage", v)} decreaseLabel={labels.decrease} increaseLabel={labels.increase} />
                </div>
              </div>

              <hr className="border-gray-100 dark:border-white/5" />

              <div>
                <h3 className="mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  {labels.amenitiesTitle}
                </h3>
                <div className="space-y-2">
                  {labels.amenityOptions.map(({ value, label }) => (
                    <label key={value} className="group flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={amenityList.includes(value)}
                        onChange={() => toggleAmenity(value)}
                        className="h-4 w-4 rounded border-gray-300 text-mosque focus:ring-mosque"
                      />
                      <span className="text-sm text-gray-700 transition-colors group-hover:text-nordic dark:text-gray-300 dark:group-hover:text-white">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
                {customAmenities.length > 0 && (
                  <p className={helpCls}>{labels.amenities}: {customAmenities.join(", ")}</p>
                )}
                <input
                  id="pf-amenities" value={form.amenities}
                  onChange={(e) => set("amenities", e.target.value)}
                  className={`${inputCls} mt-3`}
                  aria-label={labels.amenities}
                />
                <p className={helpCls}>{labels.amenitiesHelp}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Barra móvil fija */}
        <div className="fixed right-0 bottom-0 left-0 z-40 flex gap-3 border-t border-gray-200 bg-white p-4 shadow-xl md:hidden dark:border-white/10 dark:bg-[#0f231f]">
          <button
            type="button"
            onClick={() => router.push("/admin/properties")}
            className="flex-1 rounded-lg border border-gray-300 bg-white py-3 font-medium text-nordic dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
          >
            {labels.cancel}
          </button>
          <button
            type="submit"
            disabled={isPending || !isDirty}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-mosque bg-transparent py-3 font-medium text-mosque transition-colors hover:bg-mosque/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? labels.saving : labels.saveProperty}
          </button>
        </div>
      </form>
    </div>
  );
}
