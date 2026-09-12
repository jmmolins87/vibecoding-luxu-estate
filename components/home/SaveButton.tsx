"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

interface SaveButtonProps {
  className?: string;
}

/**
 * Client island: toggle de favorito con optimistic UI local.
 * `preventDefault + stopPropagation` para no navegar cuando vive
 * dentro de un `Link` de tarjeta.
 */
export default function SaveButton({ className }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-label="Save property"
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
