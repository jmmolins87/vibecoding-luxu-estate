import type { UserRole } from "@/lib/auth/roles";

const styles: Record<UserRole, string> = {
  admin:
    "bg-mosque/10 text-mosque dark:bg-hint/15 dark:text-hint",
  user: "bg-nordic/5 text-nordic/70 dark:bg-white/10 dark:text-gray-300",
};

export default function RoleBadge({
  role,
  label,
}: {
  role: UserRole;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[role]}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${role === "admin" ? "bg-mosque dark:bg-hint" : "bg-nordic/40 dark:bg-gray-500"}`}
      />
      {label}
    </span>
  );
}
