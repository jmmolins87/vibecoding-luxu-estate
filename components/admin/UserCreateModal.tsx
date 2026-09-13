"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { createAdminUser } from "@/lib/actions/admin";
import type { UserRole } from "@/lib/auth/roles";

export interface UserCreateModalLabels {
  addUser: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
  adminRole: string;
  userRole: string;
  save: string;
  saving: string;
  cancel: string;
  userCreated: string;
  errorDefault: string;
}

const inputClass =
  "w-full rounded-lg border border-nordic/10 bg-white px-3 py-2 text-sm text-nordic outline-none placeholder:text-nordic/30 focus:border-mosque focus:ring-2 focus:ring-mosque/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500";

/**
 * Alta de usuarios desde el directorio: botón "Añadir usuario" (estilo
 * outline del diseño) que abre una modal con nombre, correo, contraseña
 * y rol. Crea el usuario con email confirmado vía Auth Admin API.
 */
export default function UserCreateModal({
  labels,
}: {
  labels: UserCreateModalLabels;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Cerrar con ESC + bloquear scroll mientras el modal está abierto.
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modalOpen, isPending]);

  function openModal() {
    setName("");
    setMail("");
    setPassword("");
    setRole("user");
    setError(null);
    setModalOpen(true);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await createAdminUser({
          fullName: name,
          email: mail,
          password,
          role,
        });
        setModalOpen(false);
        notify(labels.userCreated);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : labels.errorDefault);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center justify-center rounded-lg border border-mosque bg-transparent px-4 py-2.5 text-sm font-medium whitespace-nowrap text-mosque transition-colors hover:bg-mosque/5 focus:ring-2 focus:ring-mosque focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-[#0f231f]"
      >
        <Icon name="plus" className="mr-2 h-5 w-5" />
        {labels.addUser}
      </button>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={labels.addUser}
        >
          <div
            className="absolute inset-0 bg-nordic/40 backdrop-blur-sm"
            onClick={() => !isPending && setModalOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#0f231f]">
            <header className="flex items-center justify-between border-b border-nordic/5 px-6 py-4 dark:border-white/10">
              <h2 className="text-lg font-semibold text-nordic dark:text-white">
                {labels.addUser}
              </h2>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setModalOpen(false)}
                aria-label={labels.cancel}
                className="rounded-full p-2 text-nordic/60 transition-colors hover:bg-nordic/5 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/10"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </header>

            <div className="space-y-4 p-6">
              <div>
                <label
                  htmlFor="new-user-name"
                  className="mb-1.5 block text-xs font-semibold tracking-wider text-nordic/60 uppercase dark:text-gray-400"
                >
                  {labels.fullName}
                </label>
                <input
                  id="new-user-name"
                  type="text"
                  value={name}
                  disabled={isPending}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="new-user-email"
                  className="mb-1.5 block text-xs font-semibold tracking-wider text-nordic/60 uppercase dark:text-gray-400"
                >
                  {labels.email}
                </label>
                <input
                  id="new-user-email"
                  type="email"
                  required
                  value={mail}
                  disabled={isPending}
                  onChange={(e) => setMail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="new-user-password"
                  className="mb-1.5 block text-xs font-semibold tracking-wider text-nordic/60 uppercase dark:text-gray-400"
                >
                  {labels.password}
                </label>
                <input
                  id="new-user-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  disabled={isPending}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <span
                  id="new-user-role-label"
                  className="mb-1.5 block text-xs font-semibold tracking-wider text-nordic/60 uppercase dark:text-gray-400"
                >
                  {labels.role}
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="new-user-role-label"
                  className="grid grid-cols-2 gap-1 rounded-lg bg-nordic/5 p-1 dark:bg-white/10"
                >
                  {(["user", "admin"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      role="radio"
                      aria-checked={role === r}
                      disabled={isPending}
                      onClick={() => setRole(r)}
                      className={
                        role === r
                          ? "rounded-md bg-white px-3 py-2 text-sm font-semibold text-mosque shadow-sm disabled:opacity-60 dark:bg-mosque dark:text-white"
                          : "rounded-md px-3 py-2 text-sm font-medium text-nordic/60 transition-colors hover:text-nordic disabled:opacity-60 dark:text-gray-400 dark:hover:text-white"
                      }
                    >
                      {r === "admin" ? labels.adminRole : labels.userRole}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <footer className="flex items-center justify-end gap-3 border-t border-nordic/5 px-6 py-4 dark:border-white/10">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-nordic/70 transition-colors hover:bg-nordic/5 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/10"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSave}
                className="rounded-lg bg-mosque px-5 py-2 text-sm font-medium text-white shadow-md shadow-mosque/20 transition-all hover:bg-mosque/90 disabled:opacity-60"
              >
                {isPending ? labels.saving : labels.save}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
