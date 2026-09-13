"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { setPropertyActive } from "@/lib/actions/admin";

/**
 * Activación/desactivación lógica de una propiedad (solo icono) con
 * modal de confirmación. Desactivar oculta la propiedad de la web
 * pública pero la conserva en la BD para futuras actualizaciones.
 */
export default function TogglePropertyActiveButton({
  id,
  title,
  isActive,
  labels,
}: {
  id: string;
  title: string;
  isActive: boolean;
  labels: {
    activate: string;
    deactivate: string;
    activating: string;
    deactivating: string;
    confirmActivate: string;
    confirmDeactivate: string;
    cancel: string;
    propertyActivated: string;
    propertyDeactivated: string;
    errorDefault: string;
  };
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

  function confirmToggle() {
    setConfirmOpen(false);
    setError(null);
    startTransition(async () => {
      try {
        await setPropertyActive(id, !isActive);
        notify(isActive ? labels.propertyDeactivated : labels.propertyActivated);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : labels.errorDefault);
      }
    });
  }

  const actionLabel = isActive ? labels.deactivate : labels.activate;
  const pendingLabel = isActive ? labels.deactivating : labels.activating;

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          setConfirmOpen(true);
        }}
        title={`${actionLabel}: ${title}`}
        aria-label={`${actionLabel}: ${title}`}
        className={
          isActive
            ? "shrink-0 rounded-lg p-1.5 text-nordic/40 transition-all hover:bg-red-500/10 hover:text-red-600 disabled:opacity-60 dark:text-gray-400 dark:hover:bg-red-500/20 dark:hover:text-red-400"
            : "shrink-0 rounded-lg p-1.5 text-nordic/40 transition-all hover:bg-mosque/10 hover:text-mosque disabled:opacity-60 dark:text-gray-400 dark:hover:bg-mosque/20 dark:hover:text-hint"
        }
      >
        {isPending ? (
          <span
            aria-hidden="true"
            className="block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-40"
          />
        ) : (
          <Icon name={isActive ? "block" : "eye"} className="h-5 w-5" />
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
          aria-label={actionLabel}
          aria-describedby={`confirm-toggle-desc-${id}`}
        >
          <div
            className="absolute inset-0 bg-nordic/40 backdrop-blur-sm"
            onClick={() => !isPending && setConfirmOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#0f231f]">
            <header className="flex items-center justify-between border-b border-nordic/5 px-6 py-4 dark:border-white/10">
              <h2 className="text-lg font-semibold text-nordic dark:text-white">
                {actionLabel}
              </h2>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmOpen(false)}
                aria-label={labels.cancel}
                className="rounded-full p-2 text-nordic/60 transition-colors hover:bg-nordic/5 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/10"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </header>

            <div className="flex items-start gap-4 p-6">
              <span
                aria-hidden="true"
                className={
                  isActive
                    ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mosque/10 text-mosque dark:bg-mosque/20 dark:text-hint"
                }
              >
                <Icon name={isActive ? "block" : "eye"} className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p
                  id={`confirm-toggle-desc-${id}`}
                  className="text-sm text-nordic/80 dark:text-gray-200"
                >
                  {isActive ? labels.confirmDeactivate : labels.confirmActivate}
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
                onClick={confirmToggle}
                className={
                  isActive
                    ? "inline-flex items-center justify-center rounded-lg border border-red-600 bg-transparent px-4 py-2.5 text-sm font-medium whitespace-nowrap text-red-600 transition-colors hover:bg-red-500/10 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:opacity-60 dark:border-red-400 dark:text-red-400 dark:focus:ring-offset-[#0f231f]"
                    : "inline-flex items-center justify-center rounded-lg border border-mosque bg-transparent px-4 py-2.5 text-sm font-medium whitespace-nowrap text-mosque transition-colors hover:bg-mosque/5 focus:ring-2 focus:ring-mosque focus:ring-offset-2 focus:outline-none disabled:opacity-60 dark:focus:ring-offset-[#0f231f]"
                }
              >
                {isPending ? pendingLabel : actionLabel}
              </button>
            </footer>
          </div>
        </div>
      )}
    </span>
  );
}
