"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import {
  banAdminUser,
  deleteAdminUser,
  unbanAdminUser,
  updateAdminUser,
} from "@/lib/actions/admin";

export interface UserActionsLabels {
  editUser: string;
  deleteUser: string;
  blockUser: string;
  unblockUser: string;
  fullName: string;
  email: string;
  newPassword: string;
  passwordHint: string;
  save: string;
  saving: string;
  cancel: string;
  confirmDeleteUser: string;
  confirmBlockUser: string;
  cannotDeleteSelf: string;
  cannotBlockSelf: string;
  blocking: string;
  userSaved: string;
  userDeleted: string;
  userBlocked: string;
  userUnblocked: string;
  errorDefault: string;
}

const inputClass =
  "w-full rounded-lg border border-nordic/10 bg-white px-3 py-2 text-sm text-nordic outline-none placeholder:text-nordic/30 focus:border-mosque focus:ring-2 focus:ring-mosque/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500";

/**
 * Acciones por usuario: editar (nombre, correo, contraseña) en modal
 * y eliminar con confirmación. Isla cliente dentro de `UserCard`.
 */
export default function UserActions({
  userId,
  email,
  displayName,
  isCurrent,
  isBanned,
  labels,
}: {
  userId: string;
  email: string;
  displayName: string | null;
  isCurrent: boolean;
  /** Baneado en Auth: sin acceso a la app, pero sigue en BD. */
  isBanned: boolean;
  labels: UserActionsLabels;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmBanOpen, setConfirmBanOpen] = useState(false);
  const [name, setName] = useState(displayName ?? "");
  const [mail, setMail] = useState(email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Cerrar con ESC + bloquear scroll mientras hay alguna modal abierta.
  useEffect(() => {
    if (!modalOpen && !confirmBanOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) {
        setModalOpen(false);
        setConfirmBanOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modalOpen, confirmBanOpen, isPending]);

  function openModal() {
    setName(displayName ?? "");
    setMail(email);
    setPassword("");
    setError(null);
    setModalOpen(true);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateAdminUser(userId, {
          fullName: name,
          email: mail,
          password,
        });
        setModalOpen(false);
        notify(labels.userSaved);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : labels.errorDefault);
      }
    });
  }

  function handleToggleBan() {
    if (isCurrent) {
      setError(labels.cannotBlockSelf);
      return;
    }
    // Bloquear pide confirmación en modal; desbloquear es directo.
    if (isBanned) {
      confirmBanChange(false);
      return;
    }
    setError(null);
    setConfirmBanOpen(true);
  }

  function confirmBanChange(ban: boolean) {
    setConfirmBanOpen(false);
    setError(null);
    startTransition(async () => {
      try {
        if (ban) {
          await banAdminUser(userId);
          notify(labels.userBlocked);
        } else {
          await unbanAdminUser(userId);
          notify(labels.userUnblocked);
        }
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : labels.errorDefault);
      }
    });
  }

  function handleDelete() {
    if (isCurrent) {
      setError(labels.cannotDeleteSelf);
      return;
    }
    if (!window.confirm(`${labels.confirmDeleteUser}\n\n${email}`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteAdminUser(userId);
        notify(labels.userDeleted);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : labels.errorDefault);
      }
    });
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-1 md:w-auto md:items-end">
      <div className="flex w-full items-center justify-end gap-2 md:w-auto">
        <button
          type="button"
          onClick={openModal}
          title={`${labels.editUser}: ${email}`}
          aria-label={`${labels.editUser}: ${email}`}
          className="rounded-lg p-2 text-nordic/40 transition-all hover:bg-mosque/10 hover:text-mosque dark:text-gray-400 dark:hover:bg-mosque/20 dark:hover:text-hint"
        >
          <Icon name="edit" className="h-5 w-5" />
        </button>
        <button
          type="button"
          disabled={isPending || isCurrent}
          onClick={handleToggleBan}
          title={
            isCurrent
              ? labels.cannotBlockSelf
              : `${isBanned ? labels.unblockUser : labels.blockUser}: ${email}`
          }
          aria-label={
            isCurrent
              ? labels.cannotBlockSelf
              : `${isBanned ? labels.unblockUser : labels.blockUser}: ${email}`
          }
          aria-pressed={isBanned}
          className={`rounded-lg p-2 transition-all disabled:opacity-40 ${
            isBanned
              ? "bg-mosque/10 text-mosque hover:bg-mosque/20 dark:bg-mosque/20 dark:text-hint"
              : "text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-500/20 dark:hover:text-amber-300"
          }`}
        >
          <Icon name="block" className="h-5 w-5" />
        </button>
        <button
          type="button"
          disabled={isPending || isCurrent}
          onClick={handleDelete}
          title={isCurrent ? labels.cannotDeleteSelf : `${labels.deleteUser}: ${email}`}
          aria-label={isCurrent ? labels.cannotDeleteSelf : `${labels.deleteUser}: ${email}`}
          className="rounded-lg p-2 text-nordic/40 transition-all hover:bg-red-500/10 hover:text-red-600 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-red-500/20 dark:hover:text-red-400"
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
      </div>
      {error && !modalOpen && (
        <p role="alert" className="max-w-44 text-right text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${labels.editUser}: ${email}`}
        >
          <div
            className="absolute inset-0 bg-nordic/40 backdrop-blur-sm"
            onClick={() => !isPending && setModalOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#0f231f]">
            <header className="flex items-center justify-between border-b border-nordic/5 px-6 py-4 dark:border-white/10">
              <h2 className="text-lg font-semibold text-nordic dark:text-white">
                {labels.editUser}
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
                  htmlFor={`user-name-${userId}`}
                  className="mb-1.5 block text-xs font-semibold tracking-wider text-nordic/60 uppercase dark:text-gray-400"
                >
                  {labels.fullName}
                </label>
                <input
                  id={`user-name-${userId}`}
                  type="text"
                  value={name}
                  disabled={isPending}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor={`user-email-${userId}`}
                  className="mb-1.5 block text-xs font-semibold tracking-wider text-nordic/60 uppercase dark:text-gray-400"
                >
                  {labels.email}
                </label>
                <input
                  id={`user-email-${userId}`}
                  type="email"
                  value={mail}
                  disabled={isPending}
                  onChange={(e) => setMail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor={`user-password-${userId}`}
                  className="mb-1.5 block text-xs font-semibold tracking-wider text-nordic/60 uppercase dark:text-gray-400"
                >
                  {labels.newPassword}
                </label>
                <input
                  id={`user-password-${userId}`}
                  type="password"
                  value={password}
                  minLength={6}
                  autoComplete="new-password"
                  disabled={isPending}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={labels.passwordHint}
                  className={inputClass}
                />
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

      {confirmBanOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-label={labels.blockUser}
          aria-describedby={`confirm-ban-desc-${userId}`}
        >
          <div
            className="absolute inset-0 bg-nordic/40 backdrop-blur-sm"
            onClick={() => !isPending && setConfirmBanOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#0f231f]">
            <header className="flex items-center justify-between border-b border-nordic/5 px-6 py-4 dark:border-white/10">
              <h2 className="text-lg font-semibold text-nordic dark:text-white">
                {labels.blockUser}
              </h2>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmBanOpen(false)}
                aria-label={labels.cancel}
                className="rounded-full p-2 text-nordic/60 transition-colors hover:bg-nordic/5 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/10"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </header>

            <div className="flex items-start gap-4 p-6">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
              >
                <Icon name="block" className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p
                  id={`confirm-ban-desc-${userId}`}
                  className="text-sm text-nordic/80 dark:text-gray-200"
                >
                  {labels.confirmBlockUser}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-nordic dark:text-white">
                  {email}
                </p>
              </div>
            </div>

            <footer className="flex items-center justify-end gap-3 border-t border-nordic/5 px-6 py-4 dark:border-white/10">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmBanOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-nordic/70 transition-colors hover:bg-nordic/5 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/10"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => confirmBanChange(true)}
                className="inline-flex items-center justify-center rounded-lg border border-amber-600 bg-transparent px-4 py-2.5 text-sm font-medium whitespace-nowrap text-amber-600 transition-colors hover:bg-amber-500/10 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none disabled:opacity-60 dark:border-amber-400 dark:text-amber-400 dark:focus:ring-offset-[#0f231f]"
              >
                {isPending ? labels.blocking : labels.blockUser}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
