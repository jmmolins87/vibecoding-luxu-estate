import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Icon from "@/components/ui/Icon";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, createTranslator } from "@/lib/i18n/dictionaries";

export default async function PropertyNotFound() {
  const locale = await getLocale();
  const t = createTranslator(getDictionary(locale));
  return (
    <div className="min-h-full bg-clearday font-display text-nordic antialiased dark:bg-[#0f231f] dark:text-white">
      <Navbar />
      <main className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-mosque/10">
          <Icon name="place" className="h-8 w-8 text-mosque" />
        </div>
        <h1 className="mb-2 text-3xl font-semibold">{t("property.notFound")}</h1>
        <p className="mb-8 max-w-md text-nordic/60 dark:text-gray-300">
          {t("notFound.description")}
        </p>
        <Link
          href="/"
          className="rounded-lg bg-mosque px-6 py-3 font-medium text-white shadow-lg shadow-mosque/20 transition-all hover:bg-[#005544]"
        >
          {t("notFound.backToHome")}
        </Link>
      </main>
    </div>
  );
}
