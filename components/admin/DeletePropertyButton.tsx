"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { deleteProperty } from "@/lib/actions/admin";

/** Botón de borrado (solo icono) con confirmación. */
export default function DeletePropertyButton({
  id,
  title,
  labels,
}: {
  id: string;
  title: string;
  labels: { del: string; deleting: string; confirm: string; propertyDeleted: string; errorDefault: string };
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`${labels.confirm}\n\n${title}`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteProperty(id);
        notify(labels.propertyDeleted);
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
        title={`${labels.del}: ${title}`}
        aria-label={`${labels.del}: ${title}`}
        className="rounded-lg p-2 text-nordic/40 transition-all hover:bg-red-500/10 hover:text-red-600 disabled:opacity-60 dark:text-gray-400 dark:hover:bg-red-500/20 dark:hover:text-red-400"
      >
        {isPending ? (
          <span
            aria-hidden="true"
            className="block h-5 w-5 animate-spin rounded-full border-2 border-red-500/30 border-t-red-500"
          />
        ) : (
          <Icon name="delete" className="h-5 w-5" />
        )}
      </button>
      {error && (
        <span role="alert" className="max-w-44 text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </span>
  );
}
