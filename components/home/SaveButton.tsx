"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslations } from "@/lib/i18n/client";

interface SaveButtonProps {
  className?: string;
}

/**
 * Client island: toggle de favorito con optimistic UI local.
 * `preventDefault + stopPropagation` para no navegar cuando vive
 * dentro de un `Link` de tarjeta.
 */
export default function SaveButton({ className }: SaveButtonProps) {
  const { t } = useTranslations();
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-label={saved ? t("saveButton.unsave") : t("saveButton.save")}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved((s) => !s);
      }}
      className={className}
    >
      <Icon
        name="heart"
        className={`h-5 w-5 ${saved ? "fill-mosque text-mosque" : ""}`}
      />
    </button>
  );
}
