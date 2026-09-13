import Link from "next/link";

function hrefFor(
  basePath: string,
  params: { q?: string; page: number },
): string {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.page > 1) qs.set("page", String(params.page));
  const suffix = qs.toString();
  return suffix === "" ? basePath : `${basePath}?${suffix}`;
}

/**
 * Paginador del BACKEND: enlaces que cambian `?page=` (conservando `?q=`).
 * La página (Server Component) pide a Supabase solo esa ventana.
 */
export default function Pagination({
  basePath,
  page,
  totalPages,
  query,
  prevLabel,
  nextLabel,
  pageInfo,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  query: string;
  prevLabel: string;
  nextLabel: string;
  pageInfo: string;
}) {
  const prevHref = hrefFor(basePath, { q: query || undefined, page: page - 1 });
  const nextHref = hrefFor(basePath, { q: query || undefined, page: page + 1 });
  const btn =
    "rounded-lg border border-nordic/10 px-4 py-2 text-sm font-medium text-nordic transition-colors dark:border-white/10 dark:text-gray-200";
  const enabled = "hover:bg-nordic/5 dark:hover:bg-white/10";
  const disabled = "pointer-events-none opacity-40";

  return (
    <nav aria-label={pageInfo} className="mt-4 flex items-center justify-between gap-3">
      <Link
        href={prevHref}
        aria-disabled={page <= 1}
        className={`${btn} ${page <= 1 ? disabled : enabled}`}
      >
        ← {prevLabel}
      </Link>
      <p className="text-sm text-nordic/60 dark:text-gray-400">{pageInfo}</p>
      <Link
        href={nextHref}
        aria-disabled={page >= totalPages}
        className={`${btn} ${page >= totalPages ? disabled : enabled}`}
      >
        {nextLabel} →
      </Link>
    </nav>
  );
}
