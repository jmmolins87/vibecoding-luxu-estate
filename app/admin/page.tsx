import Link from "next/link";
import StatCard from "@/components/admin/StatCard";
import { getAdminStats } from "@/lib/actions/admin";
import { withMinDuration } from "@/lib/delay";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator, getDictionary } from "@/lib/i18n/dictionaries";

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const t = createTranslator(getDictionary(locale));
  const stats = await withMinDuration(getAdminStats());

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{t("admin.dashboard")}</h1>
      <p className="mt-1 text-sm text-nordic/60 dark:text-gray-400">{t("admin.subtitle")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label={t("admin.totalProperties")} value={stats.totalProperties} icon="building" accent />
        <StatCard label={t("admin.featured")} value={stats.featuredCount} icon="star" />
        <StatCard label={t("admin.forSale")} value={stats.forSale} icon="checkCircle" />
        <StatCard label={t("admin.forRent")} value={stats.forRent} icon="calendar" />
        <StatCard label={t("admin.totalUsers")} value={stats.totalUsers} icon="heart" />
        <StatCard label={t("admin.admins")} value={stats.adminCount} icon="star" />
      </div>

      <h2 className="mt-8 text-lg font-semibold">{t("admin.quickActions")}</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/properties/new"
          className="rounded-2xl border border-nordic/10 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5"
        >
          <p className="font-medium">{t("admin.newProperty")}</p>
          <p className="mt-1 text-sm text-nordic/60 dark:text-gray-400">{t("admin.properties")}</p>
        </Link>
        <Link
          href="/admin/properties"
          className="rounded-2xl border border-nordic/10 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5"
        >
          <p className="font-medium">{t("admin.manageProperties")}</p>
          <p className="mt-1 text-sm text-nordic/60 dark:text-gray-400">
            {stats.totalProperties} · {t("admin.properties").toLowerCase()}
          </p>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-2xl border border-nordic/10 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5"
        >
          <p className="font-medium">{t("admin.manageUsers")}</p>
          <p className="mt-1 text-sm text-nordic/60 dark:text-gray-400">
            {stats.totalUsers} · {t("admin.users").toLowerCase()}
          </p>
        </Link>
      </div>
    </div>
  );
}
