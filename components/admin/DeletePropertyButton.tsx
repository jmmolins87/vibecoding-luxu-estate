"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProperty } from "@/lib/actions/admin";

/** Botón de borrado con confirmación para la tabla del servidor. */
export default function DeletePropertyButton({
  id,
  title,
  labels,
}: {
  id: string;
  title: string;
  labels: { del: string; deleting: string; confirm: string; errorDefault: string };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`${labels.confirm}\n\n${title}`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteProperty(id);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : labels.errorDefault);
      }
    });
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="inline-flex rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-60 dark:text-red-400"
      >
        {isPending ? labels.deleting : labels.del}
      </button>
      {error && (
        <span role="alert" className="max-w-44 text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </span>
  );
}
