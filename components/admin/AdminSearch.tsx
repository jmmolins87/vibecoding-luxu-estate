"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

/**
 * Buscador que filtra en el BACKEND vía `?q=`: reescribe la URL con debounce
 * y resetea a la página 1. La página (Server Component) vuelve a pedir
 * los datos ya filtrados.
 */
export default function AdminSearch({
  placeholder,
  ariaLabel,
}: {
  placeholder: string;
  ariaLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(() => searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("q") ?? "";
      if (value === current) return;
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim() !== "") params.set("q", value.trim());
      else params.delete("q");
      params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs !== "" ? `${pathname}?${qs}` : pathname);
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  return (
    <div className="relative w-full sm:max-w-sm">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full rounded-lg border border-nordic/10 bg-white py-2.5 pr-4 pl-4 text-sm text-nordic outline-none placeholder:text-nordic/30 focus:border-mosque focus:ring-2 focus:ring-mosque/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
      />
      {isPending && (
        <span aria-hidden="true" className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-mosque/30 border-t-mosque" />
      )}
    </div>
  );
}
