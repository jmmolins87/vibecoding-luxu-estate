import RoleSelect from "@/components/admin/RoleSelect";
import type { AdminUserRow } from "@/lib/actions/admin";

interface TableLabels {
  email: string;
  role: string;
  memberSince: string;
  lastSignIn: string;
  never: string;
  adminRole: string;
  userRole: string;
  changeRole: string;
  updating: string;
  noResults: string;
  errorDefault: string;
}

function formatDate(value: string | null, never: string): string {
  if (!value) return never;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return never;
  return d.toLocaleDateString();
}

/**
 * Tabla de usuarios (Server Component): renderiza SOLO la página
 * que el backend ya paginó. El cambio de rol vive en `RoleSelect`.
 */
export default function UsersTable({
  rows,
  labels,
}: {
  rows: AdminUserRow[];
  labels: TableLabels;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-nordic/10 bg-white shadow-soft dark:border-white/10 dark:bg-white/5">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr className="border-b border-nordic/10 text-xs tracking-wide text-nordic/50 uppercase dark:border-white/10 dark:text-gray-400">
            <th scope="col" className="px-4 py-3 font-medium">{labels.email}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.role}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.memberSince}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.lastSignIn}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr
              key={u.id}
              className="border-b border-nordic/5 transition-colors last:border-0 hover:bg-nordic/[0.02] dark:border-white/5 dark:hover:bg-white/5"
            >
              <td className="px-4 py-3 font-medium text-nordic dark:text-white">{u.email}</td>
              <td className="px-4 py-3">
                <RoleSelect
                  userId={u.id}
                  email={u.email}
                  role={u.role}
                  labels={{
                    changeRole: labels.changeRole,
                    userRole: labels.userRole,
                    adminRole: labels.adminRole,
                    updating: labels.updating,
                    errorDefault: labels.errorDefault,
                  }}
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-nordic/70 dark:text-gray-300">
                {formatDate(u.createdAt, labels.never)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-nordic/70 dark:text-gray-300">
                {formatDate(u.lastSignInAt, labels.never)}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-nordic/50 dark:text-gray-400">
                {labels.noResults}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
