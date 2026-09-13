import Link from "next/link";
import Icon from "@/components/ui/Icon";

function hrefFor(
  basePath: string,
  params: { q?: string; role?: string; page: number },
): string {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.role) qs.set("role", params.role);
  if (params.page > 1) qs.set("page", String(params.page));
  const suffix = qs.toString();
  return suffix === "" ? basePath : `${basePath}?${suffix}`;
}

/** Ventana de páginas estilo diseño: 1 … actual-1, actual, actual+1 … última. */
function pageWindow(page: number, totalPages: number): (number | "…")[] {
  const keep = new Set<number>([1, page - 1, page, page + 1, totalPages]);
  const nums = [...keep].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

/**
 * Paginador del BACKEND con el estilo del diseño `admin_user_directory_cards`:
 * texto "Showing X to Y of Z" + páginas numeradas (enlaces que cambian
 * `?page=` conservando `?q=` y `?role=`).
 */
export default function Pagination({
  basePath,
  page,
  totalPages,
  query,
  role,
  prevLabel,
  nextLabel,
  showingText,
  ariaLabel,
  variant = "numbered",
}: {
  basePath: string;
  page: number;
  totalPages: number;
  query: string;
  role?: string;
  prevLabel: string;
  nextLabel: string;
  showingText: string;
  ariaLabel: string;
  variant?: "numbered" | "simple";
}) {
  const href = (p: number) =>
    hrefFor(basePath, { q: query || undefined, role, page: p });

  // Variante del diseño `property_management_dashboard`:
  // texto + botones Anterior/Siguiente dentro del contenedor.
  if (variant === "simple") {
    const btn =
      "rounded-md border border-nordic/10 px-3 py-1 text-sm text-nordic/70 transition-colors hover:bg-white hover:text-mosque dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-hint";
    const disabled = "pointer-events-none opacity-40";
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="hidden text-sm text-nordic/60 sm:block dark:text-gray-400">
          {showingText}
        </p>
        <div className="flex gap-2">
          <Link
            href={href(page - 1)}
            aria-disabled={page <= 1}
            className={`${btn} ${page <= 1 ? disabled : ""}`}
          >
            {prevLabel}
          </Link>
          <Link
            href={href(page + 1)}
            aria-disabled={page >= totalPages}
            className={`${btn} ${page >= totalPages ? disabled : ""}`}
          >
            {nextLabel}
          </Link>
        </div>
      </div>
    );
  }

  const num =
    "relative mx-1 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors";
  const chevron =
    "relative inline-flex items-center px-2 py-2 text-sm font-medium text-nordic/50 transition-colors hover:text-mosque dark:text-gray-400 dark:hover:text-hint";

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="hidden text-sm text-nordic/60 sm:block dark:text-gray-400">
        {showingText}
      </p>
      <nav aria-label={ariaLabel} className="relative z-0 inline-flex -space-x-px rounded-md">
        <Link
          href={href(page - 1)}
          aria-disabled={page <= 1}
          aria-label={prevLabel}
          className={`${chevron} rounded-l-md ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
        >
          <span className="sr-only">{prevLabel}</span>
          <Icon name="arrow" className="h-5 w-5 rotate-180" />
        </Link>
        {pageWindow(page, totalPages).map((n, i) =>
          n === "…" ? (
            <span
              key={`gap-${i}`}
              aria-hidden="true"
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-nordic/40"
            >
              …
            </span>
          ) : n === page ? (
            <span
              key={n}
              aria-current="page"
              className={`${num} z-10 bg-mosque text-white shadow-sm`}
            >
              {n}
            </span>
          ) : (
            <Link
              key={n}
              href={href(n)}
              aria-label={`${ariaLabel} ${n}`}
              className={`${num} bg-transparent text-nordic/70 hover:bg-white hover:text-mosque dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-hint`}
            >
              {n}
            </Link>
          ),
        )}
        <Link
          href={href(page + 1)}
          aria-disabled={page >= totalPages}
          aria-label={nextLabel}
          className={`${chevron} rounded-r-md ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
        >
          <span className="sr-only">{nextLabel}</span>
          <Icon name="arrow" className="h-5 w-5" />
        </Link>
      </nav>
      <p className="text-sm font-medium text-nordic sm:hidden dark:text-white">
        {page} / {Math.max(totalPages, 1)}
      </p>
    </div>
  );
}
