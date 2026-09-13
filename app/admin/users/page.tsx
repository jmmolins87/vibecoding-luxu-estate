import Link from "next/link";
import { Suspense } from "react";
import UserCard from "@/components/admin/UserCard";
import AdminSearch from "@/components/admin/AdminSearch";
import Pagination from "@/components/admin/Pagination";
import UserCreateModal from "@/components/admin/UserCreateModal";
import { getAdminUsers } from "@/lib/actions/admin";
import { createAuthServerSupabaseClient } from "@/lib/supabase/server";
import { withMinDuration } from "@/lib/delay";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator, getDictionary } from "@/lib/i18n/dictionaries";

const PAGE_SIZE = 10;

type RoleFilter = "all" | "admin" | "user";

/**
 * Directorio de usuarios (diseño `admin_user_directory_cards`):
 * cabecera con búsqueda + alta, tabs por rol, cards en grid
 * de 12 columnas y paginación del backend en el pie.
 */
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; role?: string }>;
}) {
  const locale = await getLocale();
  const t = createTranslator(getDictionary(locale));
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const roleFilter: RoleFilter =
    params.role === "admin" || params.role === "user" ? params.role : "all";
  const { users, total, totalPages, page } = await withMinDuration(
    getAdminUsers({
      page: Number(params.page ?? 1),
      perPage: PAGE_SIZE,
      query,
      role: roleFilter === "all" ? undefined : roleFilter,
    }),
  );

  // Marca sutil en la card del usuario actual.
  const supabase = await createAuthServerSupabaseClient();
  const currentUserId = supabase
    ? (await supabase.auth.getUser()).data.user?.id ?? null
    : null;

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const tabs: { value: RoleFilter; label: string }[] = [
    { value: "all", label: t("admin.tabAllUsers") },
    { value: "user", label: t("admin.users") },
    { value: "admin", label: t("admin.admins") },
  ];
  const tabHref = (value: RoleFilter): string => {
    const qs = new URLSearchParams();
    if (query !== "") qs.set("q", query);
    if (value !== "all") qs.set("role", value);
    const suffix = qs.toString();
    return suffix === "" ? "/admin/users" : `/admin/users?${suffix}`;
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-nordic dark:text-white">
            {t("admin.userDirectoryTitle")}
          </h1>
          <p className="mt-1 text-sm text-nordic/60 dark:text-gray-400">
            {t("admin.userDirectorySubtitle")}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <Suspense>
            <AdminSearch
              placeholder={t("admin.searchUsers")}
              ariaLabel={t("admin.search")}
            />
          </Suspense>
          <UserCreateModal
            labels={{
              addUser: t("admin.addUser"),
              fullName: t("admin.fullName"),
              email: t("admin.email"),
              password: t("auth.password"),
              role: t("admin.role"),
              adminRole: t("admin.adminRole"),
              userRole: t("admin.userRole"),
              save: t("admin.save"),
              saving: t("admin.saving"),
              cancel: t("admin.cancel"),
              userCreated: t("admin.userCreated"),
              errorDefault: t("admin.errorDefault"),
            }}
          />
        </div>
      </div>

      <div className="mt-8 flex gap-6 overflow-x-auto border-b border-nordic/10 dark:border-white/10">
        {tabs.map((tab) => {
          const active = tab.value === roleFilter;
          return (
            <Link
              key={tab.value}
              href={tabHref(tab.value)}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "border-b-2 border-mosque pb-3 text-sm font-semibold whitespace-nowrap text-mosque"
                  : "border-b-2 border-transparent pb-3 text-sm font-medium whitespace-nowrap text-nordic/60 transition-colors hover:text-nordic dark:text-gray-400 dark:hover:text-white"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 mb-2 hidden grid-cols-12 gap-4 px-6 text-xs font-semibold tracking-wider text-nordic/50 uppercase md:grid dark:text-gray-400">
        <div className="col-span-4">{t("admin.colUserDetails")}</div>
        <div className="col-span-3">{t("admin.colRoleStatus")}</div>
        <div className="col-span-3">{t("admin.colActivity")}</div>
        <div className="col-span-2 text-right">{t("admin.cols.actions")}</div>
      </div>

      <div className="space-y-4">
        {users.map((u) => (
          <UserCard
            key={u.id}
            user={u}
            isCurrent={currentUserId !== null && u.id === currentUserId}
            labels={{
              active: t("admin.active"),
              inactive: t("admin.inactive"),
              blocked: t("admin.blocked"),
              adminRole: t("admin.adminRole"),
              userRole: t("admin.userRole"),
              changeRole: t("admin.changeRole"),
              updating: t("admin.updating"),
              roleUpdatedTo: t("admin.roleUpdatedTo"),
              cannotChangeOwnRole: t("admin.cannotChangeOwnRole"),
              memberSince: t("admin.memberSince"),
              lastSignIn: t("admin.lastSignIn"),
              never: t("admin.never"),
              errorDefault: t("admin.errorDefault"),
              email: t("admin.email"),
              editUser: t("admin.editUser"),
              deleteUser: t("admin.deleteUser"),
              fullName: t("admin.fullName"),
              newPassword: t("admin.newPassword"),
              passwordHint: t("admin.passwordHint"),
              save: t("admin.save"),
              saving: t("admin.saving"),
              cancel: t("admin.cancel"),
              confirmDeleteUser: t("admin.confirmDeleteUser"),
              cannotDeleteSelf: t("admin.cannotDeleteSelf"),
              userSaved: t("admin.userSaved"),
              userDeleted: t("admin.userDeleted"),
              blockUser: t("admin.blockUser"),
              unblockUser: t("admin.unblockUser"),
              confirmBlockUser: t("admin.confirmBlockUser"),
              cannotBlockSelf: t("admin.cannotBlockSelf"),
              blocking: t("admin.blocking"),
              userBlocked: t("admin.userBlocked"),
              userUnblocked: t("admin.userUnblocked"),
            }}
          />
        ))}
        {users.length === 0 && (
          <p className="rounded-xl border border-nordic/10 bg-white px-4 py-10 text-center text-sm text-nordic/50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
            {t("admin.noUsers")}
          </p>
        )}
      </div>

      <div className="mt-6 border-t border-nordic/5 pt-6 dark:border-white/5">
        <Pagination
          basePath="/admin/users"
          page={page}
          totalPages={totalPages}
          query={query}
          role={roleFilter === "all" ? undefined : roleFilter}
          prevLabel={t("pagination.previous")}
          nextLabel={t("pagination.next")}
          showingText={t("admin.showingUsers", { from, to, total })}
          ariaLabel={t("pagination.ariaLabel")}
        />
      </div>
    </div>
  );
}
