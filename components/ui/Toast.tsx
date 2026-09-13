"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Icon from "@/components/ui/Icon";
import { useTranslations } from "@/lib/i18n/client";

export type ToastKind = "success" | "error";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  /** Muestra un toast (éxito por defecto). Se oculta solo a los 4 s. */
  notify: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>.");
  return ctx;
}

const AUTO_DISMISS_MS = 4000;
const MAX_VISIBLE = 3;

/** Contenedor global de toasts (éxito/error). Montar una vez en el layout raíz. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslations();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, kind: ToastKind = "success") => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { id, kind, message }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === "error" ? "alert" : "status"}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-nordic/10 bg-white px-4 py-3 shadow-xl dark:border-white/10 dark:bg-[#152e2a]"
          >
            <Icon
              name={toast.kind === "success" ? "checkCircle" : "inactive"}
              className={`mt-0.5 h-5 w-5 shrink-0 ${
                toast.kind === "success"
                  ? "text-mosque dark:text-hint"
                  : "text-red-500"
              }`}
            />
            <p className="flex-1 text-sm font-medium text-nordic dark:text-white">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label={t("common.close")}
              className="rounded-full p-1 text-nordic/40 transition-colors hover:bg-nordic/5 hover:text-nordic dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
