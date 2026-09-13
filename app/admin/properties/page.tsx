import Link from "next/link";
import { Suspense } from "react";
import PropertiesTable from "@/components/admin/PropertiesTable";
import AdminSearch from "@/components/admin/AdminSearch";
import Pagination from "@/components/admin/Pagination";
import { getAdminProperties } from "@/lib/actions/admin";
import { withMinDuration } from "@/lib/delay";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator, getDictionary } from "@/lib/i18n/dictionaries";

const PAGE_SIZE = 10;

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const locale = await getLocale();
  const t = createTranslator(getDictionary(locale));
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const { rows, total, totalPages, page } = await withMinDuration(
    getAdminProperties({
      page: Number(params.page ?? 1),
      pageSize: PAGE_SIZE,
      query,
    }),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{t("admin.properties")}</h1>
      <p className="mt-1 mb-6 text-sm text-nordic/60 dark:text-gray-400">
        {total} · {t("admin.totalProperties").toLowerCase()}
      </p>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Suspense>
          <AdminSearch
            placeholder={t("admin.searchProperties")}
            ariaLabel={t("admin.search")}
          />
        </Suspense>
        <Link
          href="/admin/properties/new"
          className="inline-flex items-center justify-center rounded-lg bg-mosque px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-mosque/90 hover:shadow-soft"
        >
          {t("admin.newProperty")}
        </Link>
      </div>

      <PropertiesTable
        rows={rows}
        labels={{
          edit: t("admin.edit"),
          del: t("admin.delete"),
          deleting: t("admin.deleting"),
          confirmDelete: t("admin.confirmDelete"),
          noResults: t("admin.noProperties"),
          errorDefault: t("admin.errorDefault"),
          colTitle: t("admin.cols.title"),
          colLocation: t("admin.cols.location"),
          colPrice: t("admin.cols.price"),
          colStatus: t("admin.cols.status"),
          colFeatured: t("admin.cols.featured"),
          colActions: t("admin.cols.actions"),
          sale: t("admin.form.sale"),
          rent: t("admin.form.rent"),
        }}
      />
      <Pagination
        basePath="/admin/properties"
        page={page}
        totalPages={totalPages}
        query={query}
        prevLabel={t("pagination.previous")}
        nextLabel={t("pagination.next")}
        pageInfo={t("admin.pageOf", { page, totalPages })}
      />
    </div>
  );
}
