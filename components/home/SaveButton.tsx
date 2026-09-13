"use client";

import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useTranslations } from "@/lib/i18n/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useSaved } from "@/components/saved/SavedProvider";

interface SaveButtonProps {
  propertyId: string;
  className?: string;
}

/**
 * Client island: toggle de favorito persistido en Supabase (`saved_homes`).
 * - Invitados: abre el login y vuelve aquí tras autenticarse.
 * - Autenticados: optimistic UI sincronizada vía `SavedProvider`.
 * `preventDefault + stopPropagation` para no navegar cuando vive
 * dentro de un `Link` de tarjeta.
 */
export default function SaveButton({ propertyId, className }: SaveButtonProps) {
  const { t } = useTranslations();
  const { user, openLogin } = useAuth();
  const { savedIds, toggle } = useSaved();
  const pathname = usePathname();

  const saved = savedIds.has(propertyId);

  return (
    <button
      type="button"
      aria-label={saved ? t("saveButton.unsave") : t("saveButton.save")}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          openLogin(pathname);
          return;
        }
        void toggle(propertyId);
      }}
      className={className}
    >
      <Icon
        name="heart"
        className={`h-5 w-5 ${saved ? "fill-red-500 text-red-500" : ""}`}
      />
    </button>
  );
}
