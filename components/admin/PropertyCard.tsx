import Link from "next/link";
import DeletePropertyButton from "@/components/admin/DeletePropertyButton";
import Icon from "@/components/ui/Icon";
import type { AdminPropertyRow } from "@/lib/actions/admin";

export interface PropertyCardLabels {
  edit: string;
  del: string;
  deleting: string;
  confirmDelete: string;
  cancel: string;
  propertyDeleted: string;
  errorDefault: string;
  sale: string;
  rent: string;
  beds: string;
  baths: string;
  monthly: string;
  sold: string;
}

function formatPrice(value: number): string {
  return `$${Number(value).toLocaleString("en-US")}`;
}

/**
 * Fila de propiedad (diseño `property_management_dashboard`):
 * imagen + título/dirección/specs | precio (+mensualidad) |
 * badge de estado con punto | editar + borrar (solo iconos).
 */
export default function PropertyCard({
  property: p,
  isLast,
  labels,
}: {
  property: AdminPropertyRow;
  isLast: boolean;
  labels: PropertyCardLabels;
}) {
  const isSale = p.status === "sale";
  const isSold = p.status === "sold";
  const addressLine = [p.address, p.location].filter(Boolean).join(", ");

  return (
    <div
      className={`group grid grid-cols-1 items-center gap-4 px-6 py-5 transition-colors hover:bg-clearday md:grid-cols-12 dark:hover:bg-mosque/5 ${isLast ? "" : "border-b border-nordic/5 dark:border-white/5"}`}
    >
      {/* Detalles */}
      <div className="col-span-12 flex items-center gap-4 md:col-span-6">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-nordic/5 dark:bg-white/10">
          {p.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              src={p.image}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <Icon name="building" className="h-8 w-8 text-nordic/20 dark:text-gray-600" />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <Link
            href={`/admin/properties/${p.id}`}
            className="block truncate text-lg font-bold text-nordic transition-colors group-hover:text-mosque dark:text-white dark:group-hover:text-hint"
          >
            {p.title}
          </Link>
          {addressLine !== "" && (
            <p className="truncate text-sm text-nordic/50 dark:text-gray-400">
              {addressLine}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-nordic/40 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Icon name="bed" className="h-3.5 w-3.5" />
              {p.beds} {labels.beds}
            </span>
            <span className="h-1 w-1 rounded-full bg-nordic/20 dark:bg-gray-600" />
            <span className="flex items-center gap-1">
              <Icon name="bath" className="h-3.5 w-3.5" />
              {p.baths} {labels.baths}
            </span>
            <span className="h-1 w-1 rounded-full bg-nordic/20 dark:bg-gray-600" />
            <span>
              {Number(p.area).toLocaleString("en-US")} m²
            </span>
          </div>
        </div>
      </div>

      {/* Precio */}
      <div className="col-span-6 md:col-span-2">
        <p className="text-base font-semibold text-nordic dark:text-gray-200">
          {formatPrice(p.price)}
          {p.price_suffix ?? ""}
        </p>
        {p.price_suffix ? (
          <p className="text-xs text-nordic/40 dark:text-gray-500">
            {labels.monthly}: {formatPrice(p.price)}
          </p>
        ) : null}
      </div>

      {/* Estado */}
      <div className="col-span-6 md:col-span-2">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
            isSale
              ? "border-mosque/10 bg-hint text-mosque"
              : isSold
                ? "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400"
                : "border-nordic/10 bg-nordic/5 text-nordic/60 dark:border-white/10 dark:bg-white/10 dark:text-gray-300"
          }`}
        >
          <span
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isSale ? "bg-mosque" : isSold ? "bg-red-500" : "bg-nordic/40 dark:bg-gray-500"}`}
          />
          {isSale ? labels.sale : isSold ? labels.sold : labels.rent}
        </span>
      </div>

      {/* Acciones */}
      <div className="col-span-12 flex items-center justify-end gap-2 md:col-span-2">
        <Link
          href={`/admin/properties/${p.id}`}
          title={`${labels.edit}: ${p.title}`}
          aria-label={`${labels.edit}: ${p.title}`}
          className="rounded-lg p-2 text-nordic/40 transition-all hover:bg-hint/40 hover:text-mosque dark:text-gray-400 dark:hover:bg-mosque/20 dark:hover:text-hint"
        >
          <Icon name="edit" className="h-5 w-5" />
        </Link>
        <DeletePropertyButton
          id={p.id}
          title={p.title}
          labels={{
            del: labels.del,
            deleting: labels.deleting,
            confirm: labels.confirmDelete,
            cancel: labels.cancel,
            propertyDeleted: labels.propertyDeleted,
            errorDefault: labels.errorDefault,
          }}
        />
      </div>
    </div>
  );
}
