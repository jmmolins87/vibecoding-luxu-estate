import Link from "next/link";
import { redirect } from "next/navigation";
import AdminSidebarNav from "@/components/admin/AdminSidebar";
import Icon from "@/components/ui/Icon";
import { createAuthServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/auth/roles";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator, getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Layout del panel de administración.
 * Defensa en profundidad: el proxy ya exige rol admin, pero esta
 * comprobación protege también el renderizado si el proxy se omite.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createAuthServerSupabaseClient();
  if (!supabase) redirect("/");
  const role = await getCurrentUserRole(supabase);
  if (role !== "admin") redirect("/");

  const locale = await getLocale();
  const t = createTranslator(getDictionary(locale));

  const items = [
    { href: "/admin", label: t("admin.dashboard"), icon: "grid" as const },
    { href: "/admin/properties", label: t("admin.properties"), icon: "building" as const },
    { href: "/admin/users", label: t("admin.users"), icon: "star" as const },
  ];

  return (
    <div className="min-h-full bg-clearday font-display text-nordic antialiased dark:bg-[#0f231f] dark:text-white">
      <header className="border-b border-nordic/10 bg-clearday/95 dark:border-white/5 dark:bg-[#0f231f]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mosque">
              <Icon name="building" className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-base font-semibold tracking-tight">{t("admin.title")}</p>
              <p className="hidden text-xs text-nordic/50 sm:block dark:text-gray-400">
                {t("admin.subtitle")}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-nordic/10 px-3 py-2 text-sm font-medium text-nordic transition-colors hover:bg-nordic/5 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/10"
          >
            {t("admin.backToSite")}
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row lg:px-8">
        <aside className="w-full shrink-0 md:w-56">
          <AdminSidebarNav items={items} ariaLabel={t("admin.title")} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
