"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { updateUserRole } from "@/lib/actions/admin";
import type { UserRole } from "@/lib/auth/roles";

/**
 * Menú de rol por usuario (diseño `admin_user_directory_cards`):
 * botón "Change Role" que abre un desplegable oscuro con los roles
 * disponibles. Guarda al momento vía Server Action.
 */
export default function RoleMenu({
  userId,
  email,
  role,
  isCurrent,
  labels,
}: {
  userId: string;
  email: string;
  role: UserRole;
  /** La fila propia no permite cambiarse el rol (lo impide el backend). */
  isCurrent: boolean;
  labels: {
    changeRole: string;
    userRole: string;
    adminRole: string;
    updating: string;
    roleUpdatedTo: string;
    cannotChangeOwnRole: string;
    errorDefault: string;
  };
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  function handleChange(next: UserRole) {
    setOpen(false);
    if (next === role || isPending) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateUserRole(userId, next);
        notify(
          labels.roleUpdatedTo.replace(
            "{role}",
            next === "admin" ? labels.adminRole : labels.userRole,
          ),
        );
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : labels.errorDefault);
        router.refresh();
      }
    });
  }

  const options: { value: UserRole; label: string }[] = [
    { value: "admin", label: labels.adminRole },
    { value: "user", label: labels.userRole },
  ];

  return (
    <div ref={ref} className="relative w-full md:w-auto">
      <span className="sr-only">
        {labels.changeRole}: {email}
      </span>
      <button
        type="button"
        disabled={isPending || isCurrent}
        aria-haspopup="menu"
        aria-expanded={open}
        title={isCurrent ? labels.cannotChangeOwnRole : undefined}
        aria-label={
          isCurrent
            ? labels.cannotChangeOwnRole
            : `${labels.changeRole}: ${email}`
        }
        onClick={() => setOpen((v) => !v)}
        className={
          open
            ? "inline-flex w-full items-center justify-center rounded-lg bg-mosque px-4 py-2 text-xs font-medium text-white shadow-md transition-colors hover:bg-mosque/90 focus:outline-none disabled:opacity-60 md:w-auto"
            : "inline-flex w-full items-center justify-center rounded-lg border border-nordic/10 bg-transparent px-4 py-2 text-xs font-medium text-nordic/70 transition-colors group-hover:bg-white group-hover:shadow-sm hover:border-nordic hover:text-nordic focus:outline-none disabled:opacity-60 md:w-auto dark:border-white/10 dark:text-gray-300 dark:hover:border-gray-400 dark:hover:text-white"
        }
      >
        {isPending ? labels.updating : labels.changeRole}
        <Icon
          name="arrow"
          className={`ml-2 h-4 w-4 ${open ? "-rotate-90" : "rotate-90"}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={`${labels.changeRole}: ${email}`}
          className="absolute top-full right-0 z-50 mt-2 w-48 origin-top-right overflow-hidden rounded-lg bg-mosque shadow-xl ring-1 ring-black/10"
        >
          <div className="py-1">
            {options.map((opt) => {
              const active = opt.value === role;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => handleChange(opt.value)}
                  className={`flex w-full items-center px-4 py-3 text-xs transition-colors ${
                    active
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    name="check"
                    className={`mr-3 h-3.5 w-3.5 ${active ? "text-white" : "text-transparent"}`}
                  />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="mt-1 max-w-44 text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
