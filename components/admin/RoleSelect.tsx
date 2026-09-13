"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateUserRole } from "@/lib/actions/admin";
import type { UserRole } from "@/lib/auth/roles";

/** Selector de rol en la celda: guarda al momento vía Server Action. */
export default function RoleSelect({
  userId,
  email,
  role,
  labels,
}: {
  userId: string;
  email: string;
  role: UserRole;
  labels: {
    changeRole: string;
    userRole: string;
    adminRole: string;
    updating: string;
    errorDefault: string;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: UserRole) {
    if (next === role) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateUserRole(userId, next);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : labels.errorDefault);
        router.refresh();
      }
    });
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <label className="sr-only" htmlFor={`role-${userId}`}>
        {labels.changeRole}: {email}
      </label>
      <select
        id={`role-${userId}`}
        value={role}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value as UserRole)}
        className="rounded-lg border border-nordic/10 bg-white px-3 py-1.5 text-sm font-medium text-nordic outline-none focus:border-mosque disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="user">{isPending ? labels.updating : labels.userRole}</option>
        <option value="admin">{labels.adminRole}</option>
      </select>
      {error && (
        <span role="alert" className="max-w-44 text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </span>
  );
}
