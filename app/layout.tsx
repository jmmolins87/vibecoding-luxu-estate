import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/client";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { SavedProvider } from "@/components/saved/SavedProvider";
import { getSavedPropertyIds } from "@/lib/actions/saved";
import AuthModalHost from "@/components/auth/AuthModalHost";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "LuxeEstate — Find your sanctuary",
  description:
    "Premium real estate app: curated villas, penthouses and homes for sale and rent.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  // Favoritos iniciales en servidor (sin parpadeo; [] para invitados).
  const initialSavedIds = await getSavedPropertyIds();

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <I18nProvider locale={locale} dict={dict}>
          <AuthProvider>
            <ToastProvider>
              <SavedProvider initialIds={initialSavedIds}>
                {children}
                <Suspense>
                  <AuthModalHost />
                </Suspense>
              </SavedProvider>
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
