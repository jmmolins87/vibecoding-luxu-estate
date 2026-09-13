"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import {
  AMENITY_OPTIONS,
  PROPERTY_TYPES,
  buildSearchParams,
  formatPriceShort,
  parseFilters,
  type PropertyFilters,
} from "@/lib/filters";
import { useTranslations } from "@/lib/i18n/client";

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
}

const SLIDER_MAX = 10_000_000;

function paramsRecord(sp: URLSearchParams): Record<string, string> {
  return Object.fromEntries(sp.entries());
}

/**
 * Client island: modal de filtros idéntico al diseño
 * (`antigravity/resources/search_filters_screen/code.html`),
 * adaptado a nuestros tokens (Mosque / Clear Day / Nordic / SF Pro).
 *
 * Los filtros viven en la URL (fuente única de verdad): cada cambio hace
 * `router.push` y la página se re-renderiza en el servidor.
 */
export default function FilterModal({ open, onClose, total }: FilterModalProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<PropertyFilters>({});
  const [wasOpen, setWasOpen] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingEdge = useRef<"min" | "max" | null>(null);

  // Sincroniza el borrador con la URL al abrir (ajuste durante el render,
  // patrón recomendado frente a setState dentro de un effect).
  if (open && !wasOpen) {
    setWasOpen(true);
    setDraft(parseFilters(paramsRecord(searchParams)));
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  // Cerrar con ESC + bloquear scroll del body
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const apply = (next: PropertyFilters) => {
    const status = searchParams.get("status") ?? undefined;
    const qs = buildSearchParams({
      ...next,
      status: status as "sale" | "rent" | undefined,
    });
    router.push(qs ? `/?${qs}` : "/");
  };

  const update = (patch: Partial<PropertyFilters>, immediate = true) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (immediate) {
      apply(next);
    } else {
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => apply(next), 500);
    }
  };

  const clearAll = () => {
    setDraft({});
    router.push("/");
  };

  const toggleAmenity = (value: string) => {
    const current = draft.amenities ?? [];
    update({
      amenities: current.includes(value)
        ? current.filter((a) => a !== value)
        : [...current, value],
    });
  };

  const rangeLabel =
    draft.minPrice !== undefined && draft.maxPrice !== undefined
      ? `${formatPriceShort(draft.minPrice)} – ${formatPriceShort(draft.maxPrice)}`
      : draft.minPrice !== undefined
        ? `${t("common.from")} ${formatPriceShort(draft.minPrice)}`
        : draft.maxPrice !== undefined
          ? `${t("common.upTo")} ${formatPriceShort(draft.maxPrice)}`
          : t("common.priceAny");

  const minPct =
    draft.minPrice !== undefined
      ? Math.min(100, (draft.minPrice / SLIDER_MAX) * 100)
      : 0;
  const maxPct =
    draft.maxPrice !== undefined
      ? Math.min(100, (draft.maxPrice / SLIDER_MAX) * 100)
      : 100;

  const parseMoney = (raw: string): number | undefined => {
    const n = Number(raw.replace(/[^0-9]/g, ""));
    return raw.trim() === "" || !Number.isFinite(n) ? undefined : n;
  };

  // Convierte el X del puntero (px) dentro del track a dólares.
  const dollarsFromClientX = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(pct * SLIDER_MAX);
  };

  const setMinFromSlider = (v: number) => {
    const max = draft.maxPrice ?? SLIDER_MAX;
    const clamped = Math.min(v, max);
    update({ minPrice: clamped === 0 ? undefined : clamped }, false);
  };

  const setMaxFromSlider = (v: number) => {
    const min = draft.minPrice ?? 0;
    const clamped = Math.max(v, min);
    update({ maxPrice: clamped >= SLIDER_MAX ? undefined : clamped }, false);
  };

  const slideEdge = (edge: "min" | "max", v: number) =>
    edge === "min" ? setMinFromSlider(v) : setMaxFromSlider(v);

  // Todo el track es arrastrable: al pulsar mueve el thumb más cercano.
  const trackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const v = dollarsFromClientX(e.clientX);
    const minV = draft.minPrice ?? 0;
    const maxV = draft.maxPrice ?? SLIDER_MAX;
    draggingEdge.current =
      Math.abs(v - minV) <= Math.abs(v - maxV) ? "min" : "max";
    e.currentTarget.setPointerCapture(e.pointerId);
    slideEdge(draggingEdge.current, v);
  };

  const trackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingEdge.current) return;
    slideEdge(draggingEdge.current, dollarsFromClientX(e.clientX));
  };

  const trackPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingEdge.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("filters.searchFilters")}
    >
      <div
        className="absolute inset-0 bg-nordic/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <main className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#0f231f]">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-nordic/5 bg-white px-8 py-6 dark:border-white/10 dark:bg-[#0f231f]">
          <h1 className="text-2xl font-semibold tracking-tight text-nordic dark:text-white">
            {t("filters.title")}
          </h1>
          <button
            onClick={onClose}
            aria-label={t("filters.closeAriaLabel")}
            className="rounded-full p-2 text-nordic-muted transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </header>

        {/* Scrollable content */}
        <div className="hide-scroll flex-1 space-y-10 overflow-y-auto p-8">
          {/* Location */}
          <section>
            <label
              htmlFor="filter-city"
              className="mb-3 block text-xs font-semibold tracking-wider text-nordic-muted uppercase"
            >
              {t("filters.location")}
            </label>
            <div className="group relative">
              <Icon
                name="place"
                className="absolute top-3.5 left-4 h-5 w-5 text-nordic-muted/60 transition-colors group-focus-within:text-mosque"
              />
              <input
                id="filter-city"
                type="text"
                placeholder={t("filters.locationPlaceholder")}
                value={draft.city ?? ""}
                onChange={(e) => update({ city: e.target.value || undefined }, false)}
                className="w-full rounded-lg border-0 bg-clearday py-3 pr-4 pl-12 text-nordic shadow-sm transition-all placeholder:text-nordic-muted/60 focus:bg-white focus:ring-2 focus:ring-mosque dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
              />
            </div>
          </section>

          {/* Price Range */}
          <section>
            <div className="mb-4 flex items-end justify-between">
              <label className="block text-xs font-semibold tracking-wider text-nordic-muted uppercase">
                {t("filters.priceRange")}
              </label>
              <span className="text-sm font-medium text-mosque">{rangeLabel}</span>
            </div>
            <div
              ref={trackRef}
              role="group"
              aria-label={t("filters.priceRange")}
              onPointerDown={trackPointerDown}
              onPointerMove={trackPointerMove}
              onPointerUp={trackPointerUp}
              onPointerCancel={trackPointerUp}
              className="relative mb-6 flex h-12 cursor-pointer touch-none items-center px-2 select-none"
            >
              <div className="pointer-events-none absolute w-full overflow-hidden rounded-full bg-nordic/10">
                <div
                  className="h-1 bg-mosque"
                  style={{
                    marginLeft: `${minPct}%`,
                    width: `${Math.max(0, maxPct - minPct)}%`,
                  }}
                />
              </div>
              <RangeThumb ariaLabel={t("filters.minimumPrice")} valuePct={minPct} />
              <RangeThumb ariaLabel={t("filters.maximumPrice")} valuePct={maxPct} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-clearday p-3 transition-colors focus-within:border-mosque/30 dark:bg-white/5">
                <label
                  htmlFor="filter-min"
                  className="mb-1 block text-[10px] font-medium text-nordic-muted uppercase"
                >
                  {t("filters.minPrice")}
                </label>
                <div className="flex items-center">
                  <span className="mr-1 text-nordic-muted/60">$</span>
                  <input
                    id="filter-min"
                    type="text"
                    inputMode="numeric"
                    placeholder={t("common.noMin")}
                    value={
                      draft.minPrice !== undefined
                        ? draft.minPrice.toLocaleString("en-US")
                        : ""
                    }
                    onChange={(e) =>
                      update({ minPrice: parseMoney(e.target.value) }, false)
                    }
                    className="w-full border-0 bg-transparent p-0 text-sm font-medium text-nordic focus:ring-0 dark:text-white"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-clearday p-3 transition-colors focus-within:border-mosque/30 dark:bg-white/5">
                <label
                  htmlFor="filter-max"
                  className="mb-1 block text-[10px] font-medium text-nordic-muted uppercase"
                >
                  {t("filters.maxPrice")}
                </label>
                <div className="flex items-center">
                  <span className="mr-1 text-nordic-muted/60">$</span>
                  <input
                    id="filter-max"
                    type="text"
                    inputMode="numeric"
                    placeholder={t("common.noMax")}
                    value={
                      draft.maxPrice !== undefined
                        ? draft.maxPrice.toLocaleString("en-US")
                        : ""
                    }
                    onChange={(e) =>
                      update({ maxPrice: parseMoney(e.target.value) }, false)
                    }
                    className="w-full border-0 bg-transparent p-0 text-sm font-medium text-nordic focus:ring-0 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Property Details */}
          <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <label
                htmlFor="filter-type"
                className="block text-xs font-semibold tracking-wider text-nordic-muted uppercase"
              >
                {t("filters.propertyType")}
              </label>
              <div className="relative">
                <select
                  id="filter-type"
                  value={draft.type ?? ""}
                  onChange={(e) =>
                    update({
                      type: (e.target.value || undefined) as
                        | PropertyFilters["type"]
                        | undefined,
                    })
                  }
                  className="w-full cursor-pointer appearance-none rounded-lg border-0 bg-clearday py-3 pr-10 pl-4 text-nordic focus:ring-2 focus:ring-mosque dark:bg-white/5 dark:text-white"
                >
                  <option value="">{t("filters.anyType")}</option>
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {t(`propertyType.${pt}`)}
                    </option>
                  ))}
                </select>
                <Icon
                  name="arrow"
                  className="pointer-events-none absolute top-3.5 right-3 h-5 w-5 rotate-90 text-nordic-muted/60"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Stepper
                label={t("filters.bedrooms")}
                value={draft.beds ?? 0}
                onChange={(v) =>
                  update({ beds: v === 0 ? undefined : v })
                }
                t={t}
                type="beds"
              />
              <Stepper
                label={t("filters.bathrooms")}
                value={draft.baths ?? 0}
                onChange={(v) =>
                  update({ baths: v === 0 ? undefined : v })
                }
                t={t}
                type="baths"
              />
            </div>
          </section>

          {/* Amenities */}
          <section>
            <span className="mb-4 block text-xs font-semibold tracking-wider text-nordic-muted uppercase">
              {t("filters.amenities")}
            </span>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {AMENITY_OPTIONS.map((opt) => {
                const active = draft.amenities?.includes(opt.value) ?? false;
                return (
                  <label key={opt.value} className="group relative cursor-pointer">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={active}
                      onChange={() => toggleAmenity(opt.value)}
                    />
                      <div
                      className={
                        active
                          ? "flex h-full items-center justify-center gap-2 rounded-lg border border-mosque bg-mosque/5 px-4 py-3 text-sm font-medium text-mosque transition-all hover:bg-mosque/10 dark:bg-mosque/20"
                          : "flex h-full items-center justify-center gap-2 rounded-lg border border-nordic/10 bg-white px-4 py-3 text-sm text-nordic-muted transition-all hover:border-nordic/20 peer-checked:border-mosque peer-checked:bg-mosque/5 peer-checked:text-mosque dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                      }
                    >
                      <Icon name={opt.icon} className="h-5 w-5" />
                      {t(`amenity.${opt.value}` as string) !== `amenity.${opt.value}` ? t(`amenity.${opt.value}` as string) : opt.label}
                    </div>
                    {active && (
                      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-mosque" />
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="sticky bottom-0 z-30 flex items-center justify-between border-t border-nordic/5 bg-white px-8 py-6 dark:border-white/10 dark:bg-[#0f231f]">
          <button
            onClick={clearAll}
            className="text-sm font-medium text-nordic-muted underline decoration-nordic/20 underline-offset-4 transition-colors hover:text-nordic dark:hover:text-white"
          >
            {t("filters.clearAllFilters")}
          </button>
          <button
            onClick={onClose}
            className="flex transform items-center gap-2 rounded-lg bg-mosque px-8 py-3 font-medium text-white shadow-lg shadow-mosque/30 transition-all hover:bg-mosque/90 active:scale-95"
          >
            {t("filters.showHomes", { count: total })}
            <Icon name="arrow" className="h-4 w-4" />
          </button>
        </footer>
      </main>
    </div>
  );
}

/** Thumb visual del rango. La interacción vive en el track (padre). */
function RangeThumb({
  ariaLabel,
  valuePct,
}: {
  ariaLabel: string;
  valuePct: number;
}) {
  return (
    <div
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={SLIDER_MAX}
      aria-valuenow={Math.round((valuePct / 100) * SLIDER_MAX)}
      className="pointer-events-none absolute z-10 -ml-3 h-6 w-6 cursor-pointer rounded-full border-2 border-mosque bg-white shadow-md transition-colors select-none hover:bg-mosque hover:border-white"
      style={{ left: `${valuePct}%` }}
    />
  );
}

function Stepper({
  label,
  value,
  onChange,
  t,
  type,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  type: "beds" | "baths";
}) {
  const fewerKey = type === "beds" ? "filters.fewerBedrooms" : "filters.fewerBathrooms";
  const moreKey = type === "beds" ? "filters.moreBedrooms" : "filters.moreBathrooms";
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-nordic dark:text-gray-100">
        {label}
      </span>
      <div className="flex items-center space-x-3 rounded-full bg-clearday p-1 dark:bg-white/5">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
          aria-label={t(fewerKey)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-nordic-muted shadow-sm transition-colors hover:text-mosque disabled:opacity-50 dark:bg-white/10"
        >
          <Icon name="minus" className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-sm font-semibold text-nordic dark:text-white">
          {value === 0 ? t("common.any") : `${value}+`}
        </span>
        <button
          onClick={() => onChange(Math.min(10, value + 1))}
          aria-label={t(moreKey)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-mosque shadow-sm transition-colors hover:bg-mosque hover:text-white dark:bg-white/10"
        >
          <Icon name="plus" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
