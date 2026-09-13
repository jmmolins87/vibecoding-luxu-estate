import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Icon from "@/components/ui/Icon";
import { createAuthServerSupabaseClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator, getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Ruta PROTEGIDA: exige sesión de Supabase.
 * Sin usuario redirige a `/?login=required&next=/saved`,
 * donde el AuthModalHost abre el LoginModal automáticamente.
 */
export default async function SavedPage() {
  const supabase = await createAuthServerSupabaseClient();
  const { data } = await supabase!.auth.getUser();

  if (!data.user) {
    redirect("/?login=required&next=/saved");
  }

  const locale = await getLocale();
  const t = createTranslator(getDictionary(locale));

  return (
    <div className="min-h-full bg-clearday font-display text-nordic antialiased selection:bg-mosque selection:text-white dark:bg-[#0f231f] dark:text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("saved.title")}</h1>
        <p className="mt-2 text-nordic/60 dark:text-gray-400">{t("saved.subtitle")}</p>

        <div className="mt-10 flex flex-col items-center rounded-2xl border border-nordic/10 bg-white px-6 py-16 text-center shadow-soft dark:border-white/10 dark:bg-white/5">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mosque/10 text-mosque dark:text-hint">
            <Icon name="heart" className="h-7 w-7" />
          </span>
          <h2 className="text-xl font-semibold">{t("saved.emptyTitle")}</h2>
          <p className="mt-2 max-w-sm text-sm text-nordic/60 dark:text-gray-400">
            {t("saved.emptyDesc")}
          </p>
          <Link
            href="/"
            className="mt-6 rounded-lg bg-mosque px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-mosque/90 hover:shadow-soft"
          >
            {t("saved.browse")}
          </Link>
        </div>
      </main>
    </div>
  );
}
