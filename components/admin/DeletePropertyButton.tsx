"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { deleteProperty } from "@/lib/actions/admin";

/**
 * Borrado de propiedad (solo icono) con modal de confirmación del mismo
 * estilo que la de usuarios. El botón de eliminar replica el estilo
 * outline de "Añadir", pero en rojo.
 */
export default function DeletePropertyButton({
  id,
  title,
  labels,
}: {
  id: string;
  title: string;
  labels: { del: string; deleting: string; confirm: string; cancel: string; propertyDeleted: string; errorDefault: string };
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Cerrar con ESC + bloquear scroll mientras el modal está abierto.
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) setConfirmOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [confirmOpen, isPending]);

  function confirmDelete() {
    setConfirmOpen(false);
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
        onClick={() => {
          setError(null);
          setConfirmOpen(true);
        }}
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

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-label={labels.del}
          aria-describedby={`confirm-del-desc-${id}`}
        >
          <div
            className="absolute inset-0 bg-nordic/40 backdrop-blur-sm"
            onClick={() => !isPending && setConfirmOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#0f231f]">
            <header className="flex items-center justify-between border-b border-nordic/5 px-6 py-4 dark:border-white/10">
              <h2 className="text-lg font-semibold text-nordic dark:text-white">
                {labels.del}
              </h2>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmOpen(false)}
                aria-label={labels.del}
                className="rounded-full p-2 text-nordic/60 transition-colors hover:bg-nordic/5 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/10"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </header>

            <div className="flex items-start gap-4 p-6">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
              >
                <Icon name="delete" className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p
                  id={`confirm-del-desc-${id}`}
                  className="text-sm text-nordic/80 dark:text-gray-200"
                >
                  {labels.confirm}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-nordic dark:text-white">
                  {title}
                </p>
              </div>
            </div>

            <footer className="flex items-center justify-end gap-3 border-t border-nordic/5 px-6 py-4 dark:border-white/10">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-nordic/70 transition-colors hover:bg-nordic/5 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/10"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmDelete}
                className="inline-flex items-center justify-center rounded-lg border border-red-600 bg-transparent px-4 py-2.5 text-sm font-medium whitespace-nowrap text-red-600 transition-colors hover:bg-red-500/10 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:opacity-60 dark:border-red-400 dark:text-red-400 dark:focus:ring-offset-[#0f231f]"
              >
                {isPending ? labels.deleting : labels.del}
              </button>
            </footer>
          </div>
        </div>
      )}
    </span>
  );
}
