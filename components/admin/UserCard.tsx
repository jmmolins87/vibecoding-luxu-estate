import RoleMenu from "@/components/admin/RoleMenu";
import UserActions from "@/components/admin/UserActions";
import Icon from "@/components/ui/Icon";
import type { AdminUserRow } from "@/lib/actions/admin";

export interface UserCardLabels {
  active: string;
  inactive: string;
  blocked: string;
  adminRole: string;
  userRole: string;
  changeRole: string;
  updating: string;
  roleUpdatedTo: string;
  cannotChangeOwnRole: string;
  memberSince: string;
  lastSignIn: string;
  never: string;
  errorDefault: string;
  email: string;
  editUser: string;
  deleteUser: string;
  fullName: string;
  newPassword: string;
  passwordHint: string;
  save: string;
  saving: string;
  cancel: string;
  confirmDeleteUser: string;
  cannotDeleteSelf: string;
  userSaved: string;
  userDeleted: string;
  blockUser: string;
  unblockUser: string;
  confirmBlockUser: string;
  cannotBlockSelf: string;
  blocking: string;
  userBlocked: string;
  userUnblocked: string;
}

function formatDate(value: string | null, never: string): string {
  if (!value) return never;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return never;
  return d.toLocaleDateString();
}

/** Chip de ID estable derivado del uuid: `#USR-XXXX`. */
function shortId(id: string): string {
  return `#USR-${id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Card de usuario (diseño `admin_user_directory_cards`):
 * avatar + nombre/email/ID | badge de rol + estado |
 * alta + último acceso | menú de rol.
 */
export default function UserCard({
  user,
  isCurrent,
  labels,
}: {
  user: AdminUserRow;
  isCurrent: boolean;
  labels: UserCardLabels;
}) {
  const isAdmin = user.role === "admin";
  const isActive = user.lastSignInAt !== null;
  // Bloqueado en Auth: conserva la fila en BD pero no puede acceder.
  const isBanned = user.bannedUntil !== null;
  // Aspecto "encendido" solo si ha accedido y no está bloqueado.
  const lit = isActive && !isBanned;
  const name =
    user.displayName ?? user.email.split("@")[0] ?? user.email;

  return (
    <article
      aria-current={isCurrent ? "true" : undefined}
      className={`group relative flex flex-col items-center gap-4 rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-soft md:grid md:grid-cols-12 ${
        isBanned
          ? "border-red-500/25 bg-red-500/[0.05] hover:bg-red-500/[0.09] dark:border-red-400/25 dark:bg-red-500/10 dark:hover:bg-red-500/15"
          : isCurrent
            ? "border-mosque/25 bg-mosque/[0.05] hover:bg-mosque/[0.09] dark:border-hint/25 dark:bg-mosque/15 dark:hover:bg-mosque/20"
            : "border-nordic/5 bg-white hover:bg-hint dark:border-white/10 dark:bg-white/5 dark:hover:bg-mosque/20"
      }`}
    >
      {/* Detalles del usuario */}
      <div className="col-span-12 flex w-full items-center md:col-span-4">
        <div className="relative shrink-0">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              src={user.avatarUrl}
              className={`h-12 w-12 rounded-full border-2 border-white object-cover dark:border-mosque ${lit ? "" : "grayscale"}`}
            />
          ) : (
            <span
              aria-hidden="true"
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-white text-sm font-bold dark:border-mosque ${
                lit
                  ? "bg-mosque/10 text-mosque dark:text-hint"
                  : "bg-nordic/5 text-nordic/40 dark:text-gray-500"
              }`}
            >
              {initialsOf(name) || "?"}
            </span>
          )}
          {lit && (
            <span className="absolute right-0 bottom-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
          )}
        </div>
        <div className="ml-4 overflow-hidden">
          <p
            className={`truncate text-sm font-bold ${
              lit
                ? "text-nordic dark:text-white"
                : "text-nordic/60 dark:text-gray-400"
            }`}
          >
            {name}
          </p>
          <p
            className={`truncate text-xs ${
              lit
                ? "text-nordic/70 dark:text-gray-300"
                : "text-nordic/40 dark:text-gray-500"
            }`}
          >
            {user.email}
          </p>
          <span className="mt-1 inline-block rounded bg-nordic/5 px-2 py-0.5 text-[10px] text-nordic/50 transition-colors group-hover:bg-white/50 dark:bg-white/10 dark:text-gray-400">
            ID: {shortId(user.id)}
          </span>
        </div>
      </div>

      {/* Rol y estado */}
      <div className="col-span-12 flex w-full items-center justify-between gap-4 md:col-span-3 md:justify-start">
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
            isAdmin
              ? "bg-nordic text-white"
              : "bg-nordic/5 text-nordic/60 dark:bg-white/10 dark:text-gray-300"
          }`}
        >
          {isAdmin ? labels.adminRole : labels.userRole}
        </span>
        <span
          className={`flex items-center text-xs ${
            isBanned
              ? "font-medium text-red-600 dark:text-red-400"
              : lit
                ? "text-nordic/60 dark:text-gray-400"
                : "text-nordic/40 dark:text-gray-500"
          }`}
        >
          <Icon
            name={isBanned ? "block" : lit ? "checkCircle" : "inactive"}
            className={`mr-1 h-3.5 w-3.5 ${lit && !isBanned ? "text-mosque" : ""}`}
          />
          {isBanned ? labels.blocked : lit ? labels.active : labels.inactive}
        </span>
      </div>

      {/* Actividad */}
      <div className="col-span-12 grid w-full grid-cols-2 gap-4 md:col-span-3">
        <div>
          <p className="text-[10px] tracking-wider text-nordic/40 uppercase dark:text-gray-500">
            {labels.memberSince}
          </p>
          <p
            className={`text-sm font-semibold ${
              lit
                ? "text-nordic dark:text-white"
                : "text-nordic/60 dark:text-gray-400"
            }`}
          >
            {formatDate(user.createdAt, labels.never)}
          </p>
        </div>
        <div>
          <p className="text-[10px] tracking-wider text-nordic/40 uppercase dark:text-gray-500">
            {labels.lastSignIn}
          </p>
          <p
            className={`text-sm font-semibold ${
              lit
                ? "text-nordic dark:text-white"
                : "text-nordic/60 dark:text-gray-400"
            }`}
          >
            {formatDate(user.lastSignInAt, labels.never)}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="col-span-12 flex w-full flex-col items-stretch justify-start gap-2 md:col-span-2 md:items-end">
        <RoleMenu
          userId={user.id}
          email={user.email}
          role={user.role}
          isCurrent={isCurrent}
          labels={{
            changeRole: labels.changeRole,
            userRole: labels.userRole,
            adminRole: labels.adminRole,
            updating: labels.updating,
            roleUpdatedTo: labels.roleUpdatedTo,
            cannotChangeOwnRole: labels.cannotChangeOwnRole,
            errorDefault: labels.errorDefault,
          }}
        />
        <UserActions
          userId={user.id}
          email={user.email}
          displayName={user.displayName}
          isCurrent={isCurrent}
          isBanned={isBanned}
          labels={{
            editUser: labels.editUser,
            deleteUser: labels.deleteUser,
            blockUser: labels.blockUser,
            unblockUser: labels.unblockUser,
            fullName: labels.fullName,
            email: labels.email,
            newPassword: labels.newPassword,
            passwordHint: labels.passwordHint,
            save: labels.save,
            saving: labels.saving,
            cancel: labels.cancel,
            confirmDeleteUser: labels.confirmDeleteUser,
            confirmBlockUser: labels.confirmBlockUser,
            cannotDeleteSelf: labels.cannotDeleteSelf,
            cannotBlockSelf: labels.cannotBlockSelf,
            userSaved: labels.userSaved,
            userDeleted: labels.userDeleted,
            blocking: labels.blocking,
            userBlocked: labels.userBlocked,
            userUnblocked: labels.userUnblocked,
            errorDefault: labels.errorDefault,
          }}
        />
      </div>
    </article>
  );
}
