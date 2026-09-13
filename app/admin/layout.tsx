import { redirect } from "next/navigation";
import AdminTopNav from "@/components/admin/AdminTopNav";
import { createAuthServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/auth/roles";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator, getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Layout del panel de administración.
 * Defensa en profundidad: el proxy ya exige rol admin, pero esta
 * comprobación protege también el renderizado si el proxy se omite.
 * Diseño `admin_user_directory_cards`: navbar superior LuxeEstate
 * (Dashboard / Listings / Users / Inquiries) sin sidebar, con
 * nombre/rol/avatar del admin y menú de sesión.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createAuthServerSupabaseClient();
  if (!supabase) redirect("/");
  const role = await getCurrentUserRole(supabase);
  if (role !== "admin") redirect("/");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const locale = await getLocale();
  const t = createTranslator(getDictionary(locale));

  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const metaName = meta.full_name ?? meta.name;
  const displayName =
    (typeof metaName === "string" && metaName.length > 0
      ? metaName
      : (user?.email?.split("@")[0] ?? "")) || "Admin";
  const avatar = meta.avatar_url ?? meta.picture;
  const avatarUrl =
    typeof avatar === "string" && avatar.length > 0 ? avatar : null;

  return (
    <div className="flex min-h-screen flex-col bg-clearday font-display text-nordic antialiased dark:bg-[#0f231f] dark:text-gray-100">
      <AdminTopNav
        items={[
          { href: "/admin", label: t("admin.dashboard") },
          { href: "/admin/properties", label: t("admin.properties") },
          { href: "/admin/users", label: t("admin.users") },
          { href: "#", label: t("admin.inquiries") },
        ]}
        user={{
          displayName,
          roleLabel: t("admin.adminRole"),
          avatarUrl,
        }}
        homeAriaLabel={t("nav.homeAriaLabel")}
        notificationsLabel={t("admin.notifications")}
        accountLabel={t("admin.account")}
        backToSiteLabel={t("admin.backToSite")}
        signOutLabel={t("nav.signOut")}
        signingOutLabel={t("admin.signingOut")}
      />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
