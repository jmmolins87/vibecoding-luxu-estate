import { redirect } from "next/navigation";
import SavedGrid from "@/components/saved/SavedGrid";
import { createAuthServerSupabaseClient } from "@/lib/supabase/server";
import { getSavedProperties } from "@/lib/actions/saved";
import { withMinDuration } from "@/lib/delay";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator, getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Ruta PROTEGIDA: exige sesión de Supabase.
 * Sin usuario redirige a `/?login=required&next=/saved`,
 * donde el AuthModalHost abre el LoginModal automáticamente.
 * Muestra los favoritos persistidos en `saved_homes`.
 */
export default async function SavedPage() {
  const supabase = await createAuthServerSupabaseClient();
  const { data } = await supabase!.auth.getUser();

  if (!data.user) {
    redirect("/?login=required&next=/saved");
  }

  const locale = await getLocale();
  const t = createTranslator(getDictionary(locale));
  const properties = await withMinDuration(getSavedProperties());

  return (
    <SavedGrid
      properties={properties}
      labels={{
        title: t("saved.title"),
        subtitle: t("saved.subtitle"),
        emptyTitle: t("saved.emptyTitle"),
        emptyDesc: t("saved.emptyDesc"),
        browse: t("saved.browse"),
      }}
    />
  );
}
