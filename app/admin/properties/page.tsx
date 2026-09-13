import Link from "next/link";
import { Suspense } from "react";
import PropertyCard from "@/components/admin/PropertyCard";
import AdminSearch from "@/components/admin/AdminSearch";
import PropertiesFilterButton from "@/components/admin/PropertiesFilterButton";
import Pagination from "@/components/admin/Pagination";
import Icon from "@/components/ui/Icon";
import { getAdminProperties, getAdminStats } from "@/lib/actions/admin";
import { withMinDuration } from "@/lib/delay";
import { parseFilters } from "@/lib/filters";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator, getDictionary } from "@/lib/i18n/dictionaries";

const PAGE_SIZE = 10;

/**
 * Gestión de propiedades (diseño `property_management_dashboard`):
 * cabecera con búsqueda + Filter (misma modal de la web) + alta,
 * tarjetas de stats, lista en contenedor con imagen/specs/precio/
 * estado y paginación simple en el pie.
 */
export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const locale = await getLocale();
  const t = createTranslator(getDictionary(locale));
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const filters = parseFilters(params);
  const [{ rows, total, totalPages, page }, stats] = await withMinDuration(
    Promise.all([
      getAdminProperties({
        page: Number(params.page ?? 1),
        pageSize: PAGE_SIZE,
        query,
        ...filters,
      }),
      getAdminStats(),
    ]),
  );

  const statCards = [
    {
      label: t("admin.totalProperties"),
      value: stats.totalProperties,
      icon: "building" as const,
      chip: "bg-mosque/10 text-mosque",
    },
    {
      label: t("admin.forSale"),
      value: stats.forSale,
      icon: "checkCircle" as const,
      chip: "bg-hint text-mosque",
    },
    {
      label: t("admin.featured"),
      value: stats.featuredCount,
      icon: "star" as const,
      chip: "bg-nordic/5 text-nordic/60 dark:bg-white/10 dark:text-gray-300",
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-nordic dark:text-white">
            {t("admin.myPropertiesTitle")}
          </h1>
          <p className="mt-1 text-nordic/60 dark:text-gray-400">
            {t("admin.myPropertiesSubtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense>
            <AdminSearch
              placeholder={t("admin.searchProperties")}
              ariaLabel={t("admin.search")}
            />
          </Suspense>
          <Suspense>
            <PropertiesFilterButton
              total={total}
              filterLabel={t("admin.filter")}
            />
          </Suspense>
          <Link
            href="/admin/properties/new"
            className="inline-flex items-center justify-center rounded-lg border border-mosque bg-transparent px-4 py-2.5 text-sm font-medium whitespace-nowrap text-mosque transition-colors hover:bg-mosque/5 focus:ring-2 focus:ring-mosque focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-[#0f231f]"
          >
            <Icon name="plus" className="mr-2 h-5 w-5" />
            {t("admin.newProperty")}
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between rounded-xl border border-mosque/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
          >
            <div>
              <p className="text-sm font-medium text-nordic/60 dark:text-gray-400">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-nordic dark:text-white">
                {s.value}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${s.chip}`}
            >
              <Icon name={s.icon} className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-nordic/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="hidden grid-cols-12 gap-4 border-b border-nordic/5 bg-nordic/[0.03] px-6 py-4 text-xs font-semibold tracking-wider text-nordic/50 uppercase md:grid dark:border-white/5 dark:bg-white/5 dark:text-gray-400">
          <div className="col-span-6">{t("admin.colPropertyDetails")}</div>
          <div className="col-span-2">{t("admin.cols.price")}</div>
          <div className="col-span-2">{t("admin.cols.status")}</div>
          <div className="col-span-2 text-right">{t("admin.cols.actions")}</div>
        </div>

        {rows.map((p, i) => (
          <PropertyCard
            key={p.id}
            property={p}
            isLast={i === rows.length - 1}
            labels={{
              edit: t("admin.edit"),
              del: t("admin.delete"),
              deleting: t("admin.deleting"),
              confirmDelete: t("admin.confirmDelete"),
              cancel: t("admin.cancel"),
              propertyDeleted: t("admin.propertyDeleted"),
              errorDefault: t("admin.errorDefault"),
              sale: t("admin.form.sale"),
              rent: t("admin.form.rent"),
              beds: t("propertyCard.beds"),
              baths: t("propertyCard.baths"),
              monthly: t("admin.monthly"),
            }}
          />
        ))}
        {rows.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-nordic/50 dark:text-gray-400">
            {t("admin.noProperties")}
          </p>
        )}

        <div className="border-t border-nordic/5 bg-nordic/[0.03] px-6 py-4 dark:border-white/5 dark:bg-white/5">
          <Pagination
            variant="simple"
            basePath="/admin/properties"
            page={page}
            totalPages={totalPages}
            query={query}
            prevLabel={t("pagination.previous")}
            nextLabel={t("pagination.next")}
            showingText={t("admin.showingProperties", {
              from: total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1,
              to: Math.min(page * PAGE_SIZE, total),
              total,
            })}
            ariaLabel={t("pagination.ariaLabel")}
          />
        </div>
      </div>
    </div>
  );
}
