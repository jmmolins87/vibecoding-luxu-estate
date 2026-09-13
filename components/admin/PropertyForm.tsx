"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createProperty,
  updateProperty,
  type AdminPropertyDetail,
  type PropertyFormInput,
} from "@/lib/actions/admin";
import { useToast } from "@/components/ui/Toast";

interface FormLabels {
  id: string;
  idHelp: string;
  title: string;
  location: string;
  address: string;
  price: string;
  priceSuffix: string;
  priceSuffixHelp: string;
  type: string;
  typeHouse: string;
  typeApartment: string;
  typeVilla: string;
  typePenthouse: string;
  status: string;
  sale: string;
  rent: string;
  beds: string;
  baths: string;
  area: string;
  garage: string;
  image: string;
  imageAlt: string;
  tag: string;
  tagNone: string;
  tagExclusive: string;
  tagNewArrival: string;
  tagPremium: string;
  tagNew: string;
  featuredLabel: string;
  slug: string;
  slugHelp: string;
  description: string;
  amenities: string;
  amenitiesHelp: string;
  lat: string;
  lng: string;
  extraImages: string;
  extraImagesHelp: string;
  save: string;
  create: string;
  cancel: string;
  saving: string;
  propertyCreated: string;
  propertyUpdated: string;
  errorDefault: string;
}

const inputCls =
  "w-full rounded-lg border border-nordic/10 bg-white px-4 py-2.5 text-sm text-nordic outline-none transition-all placeholder:text-nordic/30 focus:border-mosque focus:ring-2 focus:ring-mosque/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500";

const labelCls = "mb-1.5 block text-sm font-medium text-nordic dark:text-gray-200";
const helpCls = "mt-1 text-xs text-nordic/50 dark:text-gray-500";

function toFormState(detail?: AdminPropertyDetail): PropertyFormInput {
  if (!detail) {
    return {
      id: "", title: "", location: "", address: "", price: 0, priceSuffix: "",
      type: "House", status: "sale", beds: 3, baths: 2, area: 100, garage: 1,
      image: "", imageAlt: "", tag: "", featured: false, slug: "",
      description: "", amenities: "", lat: "", lng: "", extraImages: "",
    };
  }
  const extra = (detail.images ?? []).slice(1).join("\n");
  return {
    id: detail.id,
    title: detail.title,
    location: detail.location,
    address: detail.address,
    price: Number(detail.price),
    priceSuffix: detail.price_suffix ?? "",
    type: (["House", "Apartment", "Villa", "Penthouse"] as const).includes(detail.type as never)
      ? (detail.type as PropertyFormInput["type"])
      : "House",
    status: detail.status === "rent" ? "rent" : "sale",
    beds: Number(detail.beds),
    baths: Number(detail.baths),
    area: Number(detail.area),
    garage: Number(detail.garage ?? 0),
    image: detail.image,
    imageAlt: detail.image_alt ?? "",
    tag: detail.tag ?? "",
    featured: Boolean(detail.featured),
    slug: detail.slug ?? "",
    description: detail.description ?? "",
    amenities: (detail.amenities ?? []).join(", "),
    lat: detail.lat === null || detail.lat === undefined ? "" : String(detail.lat),
    lng: detail.lng === null || detail.lng === undefined ? "" : String(detail.lng),
    extraImages: extra,
  };
}

export default function PropertyForm({
  initial,
  propertyId,
  labels,
}: {
  initial?: AdminPropertyDetail;
  propertyId?: string;
  labels: FormLabels;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [form, setForm] = useState<PropertyFormInput>(() => toFormState(initial));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof PropertyFormInput>(key: K, value: PropertyFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (propertyId) {
          await updateProperty(propertyId, form);
          notify(labels.propertyUpdated);
        } else {
          await createProperty(form);
          notify(labels.propertyCreated);
        }
        router.push("/admin/properties");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : labels.errorDefault);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-title" className={labelCls}>{labels.title} *</label>
          <input id="pf-title" required value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-id" className={labelCls}>{labels.id}</label>
          <input id="pf-id" value={form.id} onChange={(e) => set("id", e.target.value)} disabled={Boolean(propertyId)} className={`${inputCls} disabled:opacity-60`} />
          <p className={helpCls}>{labels.idHelp}</p>
        </div>
        <div>
          <label htmlFor="pf-location" className={labelCls}>{labels.location} *</label>
          <input id="pf-location" required value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-address" className={labelCls}>{labels.address} *</label>
          <input id="pf-address" required value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-price" className={labelCls}>{labels.price} *</label>
          <input id="pf-price" type="number" min={0} step="any" required value={form.price} onChange={(e) => set("price", Number(e.target.value))} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-priceSuffix" className={labelCls}>{labels.priceSuffix}</label>
          <input id="pf-priceSuffix" value={form.priceSuffix} onChange={(e) => set("priceSuffix", e.target.value)} placeholder="/mo" className={inputCls} />
          <p className={helpCls}>{labels.priceSuffixHelp}</p>
        </div>
        <div>
          <label htmlFor="pf-type" className={labelCls}>{labels.type}</label>
          <select id="pf-type" value={form.type} onChange={(e) => set("type", e.target.value as PropertyFormInput["type"])} className={inputCls}>
            <option value="House">{labels.typeHouse}</option>
            <option value="Apartment">{labels.typeApartment}</option>
            <option value="Villa">{labels.typeVilla}</option>
            <option value="Penthouse">{labels.typePenthouse}</option>
          </select>
        </div>
        <div>
          <label htmlFor="pf-status" className={labelCls}>{labels.status}</label>
          <select id="pf-status" value={form.status} onChange={(e) => set("status", e.target.value as PropertyFormInput["status"])} className={inputCls}>
            <option value="sale">{labels.sale}</option>
            <option value="rent">{labels.rent}</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:col-span-2">
          <div>
            <label htmlFor="pf-beds" className={labelCls}>{labels.beds}</label>
            <input id="pf-beds" type="number" min={0} step={1} value={form.beds} onChange={(e) => set("beds", Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label htmlFor="pf-baths" className={labelCls}>{labels.baths}</label>
            <input id="pf-baths" type="number" min={0} step="any" value={form.baths} onChange={(e) => set("baths", Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label htmlFor="pf-area" className={labelCls}>{labels.area}</label>
            <input id="pf-area" type="number" min={0} step="any" value={form.area} onChange={(e) => set("area", Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label htmlFor="pf-garage" className={labelCls}>{labels.garage}</label>
            <input id="pf-garage" type="number" min={0} step={1} value={form.garage} onChange={(e) => set("garage", Number(e.target.value))} className={inputCls} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pf-image" className={labelCls}>{labels.image} *</label>
          <input id="pf-image" type="url" required value={form.image} onChange={(e) => set("image", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-imageAlt" className={labelCls}>{labels.imageAlt}</label>
          <input id="pf-imageAlt" value={form.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-tag" className={labelCls}>{labels.tag}</label>
          <select id="pf-tag" value={form.tag} onChange={(e) => set("tag", e.target.value)} className={inputCls}>
            <option value="">{labels.tagNone}</option>
            <option value="Exclusive">{labels.tagExclusive}</option>
            <option value="New Arrival">{labels.tagNewArrival}</option>
            <option value="Premium">{labels.tagPremium}</option>
            <option value="New">{labels.tagNew}</option>
          </select>
        </div>
        <div>
          <label htmlFor="pf-slug" className={labelCls}>{labels.slug}</label>
          <input id="pf-slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls} />
          <p className={helpCls}>{labels.slugHelp}</p>
        </div>
        <div className="flex items-end pb-1">
          <label htmlFor="pf-featured" className="flex cursor-pointer items-center gap-2 text-sm font-medium text-nordic dark:text-gray-200">
            <input id="pf-featured" type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-[#0e5f56]" />
            {labels.featuredLabel}
          </label>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pf-description" className={labelCls}>{labels.description}</label>
          <textarea id="pf-description" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pf-amenities" className={labelCls}>{labels.amenities}</label>
          <input id="pf-amenities" value={form.amenities} onChange={(e) => set("amenities", e.target.value)} className={inputCls} />
          <p className={helpCls}>{labels.amenitiesHelp}</p>
        </div>
        <div>
          <label htmlFor="pf-lat" className={labelCls}>{labels.lat}</label>
          <input id="pf-lat" type="number" step="any" value={form.lat} onChange={(e) => set("lat", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="pf-lng" className={labelCls}>{labels.lng}</label>
          <input id="pf-lng" type="number" step="any" value={form.lng} onChange={(e) => set("lng", e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pf-extraImages" className={labelCls}>{labels.extraImages}</label>
          <textarea id="pf-extraImages" rows={3} value={form.extraImages} onChange={(e) => set("extraImages", e.target.value)} className={`${inputCls} font-mono text-xs`} />
          <p className={helpCls}>{labels.extraImagesHelp}</p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-mosque px-6 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-mosque/90 hover:shadow-soft disabled:translate-y-0 disabled:opacity-60"
        >
          {isPending ? labels.saving : propertyId ? labels.save : labels.create}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/properties")}
          className="rounded-lg border border-nordic/10 px-6 py-2.5 text-sm font-medium text-nordic transition-colors hover:bg-nordic/5 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/10"
        >
          {labels.cancel}
        </button>
      </div>
    </form>
  );
}
