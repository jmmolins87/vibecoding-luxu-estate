import { Suspense } from "react";
import UsersTable from "@/components/admin/UsersTable";
import AdminSearch from "@/components/admin/AdminSearch";
import Pagination from "@/components/admin/Pagination";
import { getAdminUsers } from "@/lib/actions/admin";
import { withMinDuration } from "@/lib/delay";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator, getDictionary } from "@/lib/i18n/dictionaries";

const PAGE_SIZE = 10;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const locale = await getLocale();
  const t = createTranslator(getDictionary(locale));
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const { users, total, totalPages, page } = await withMinDuration(
    getAdminUsers({
      page: Number(params.page ?? 1),
      perPage: PAGE_SIZE,
      query,
    }),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{t("admin.users")}</h1>
      <p className="mt-1 mb-6 text-sm text-nordic/60 dark:text-gray-400">
        {total} · {t("admin.totalUsers").toLowerCase()}
      </p>

      <div className="mb-4">
        <Suspense>
          <AdminSearch
            placeholder={t("admin.searchUsers")}
            ariaLabel={t("admin.search")}
          />
        </Suspense>
      </div>

      <UsersTable
        rows={users}
        labels={{
          email: t("admin.email"),
          role: t("admin.role"),
          memberSince: t("admin.memberSince"),
          lastSignIn: t("admin.lastSignIn"),
          never: t("admin.never"),
          adminRole: t("admin.adminRole"),
          userRole: t("admin.userRole"),
          changeRole: t("admin.changeRole"),
          updating: t("admin.updating"),
          noResults: t("admin.noUsers"),
          errorDefault: t("admin.errorDefault"),
        }}
      />
      <Pagination
        basePath="/admin/users"
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
