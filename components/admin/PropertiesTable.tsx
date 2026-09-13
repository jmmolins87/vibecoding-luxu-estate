import Link from "next/link";
import DeletePropertyButton from "@/components/admin/DeletePropertyButton";
import type { AdminPropertyRow } from "@/lib/actions/admin";

interface TableLabels {
  edit: string;
  del: string;
  deleting: string;
  confirmDelete: string;
  noResults: string;
  errorDefault: string;
  colTitle: string;
  colLocation: string;
  colPrice: string;
  colStatus: string;
  colFeatured: string;
  colActions: string;
  sale: string;
  rent: string;
}

/**
 * Tabla de propiedades (Server Component): renderiza SOLO la página
 * que el backend ya paginó. Búsqueda, paginación, edición y borrado
 * viven en islas cliente / enlaces.
 */
export default function PropertiesTable({
  rows,
  labels,
}: {
  rows: AdminPropertyRow[];
  labels: TableLabels;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-nordic/10 bg-white shadow-soft dark:border-white/10 dark:bg-white/5">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-nordic/10 text-xs tracking-wide text-nordic/50 uppercase dark:border-white/10 dark:text-gray-400">
            <th scope="col" className="px-4 py-3 font-medium">ID</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.colTitle}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.colLocation}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.colPrice}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.colStatus}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.colFeatured}</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">{labels.colActions}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr
              key={p.id}
              className="border-b border-nordic/5 transition-colors last:border-0 hover:bg-nordic/[0.02] dark:border-white/5 dark:hover:bg-white/5"
            >
              <td className="px-4 py-3 font-mono text-xs text-nordic/60 dark:text-gray-400">{p.id}</td>
              <td className="px-4 py-3 font-medium text-nordic dark:text-white">{p.title}</td>
              <td className="max-w-55 truncate px-4 py-3 text-nordic/70 dark:text-gray-300">{p.location}</td>
              <td className="px-4 py-3 whitespace-nowrap text-nordic dark:text-white">
                ${Number(p.price).toLocaleString("en-US")}{p.price_suffix ?? ""}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${p.status === "sale" ? "bg-mosque/10 text-mosque dark:text-hint" : "bg-nordic/5 text-nordic/70 dark:bg-white/10 dark:text-gray-300"}`}>
                  {p.status === "sale" ? labels.sale : labels.rent}
                </span>
              </td>
              <td className="px-4 py-3">{p.featured ? "★" : "—"}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Link
                  href={`/admin/properties/${p.id}`}
                  className="mr-2 inline-flex rounded-lg px-3 py-1.5 text-sm font-medium text-mosque transition-colors hover:bg-mosque/10 dark:text-hint"
                >
                  {labels.edit}
                </Link>
                <DeletePropertyButton
                  id={p.id}
                  title={p.title}
                  labels={{
                    del: labels.del,
                    deleting: labels.deleting,
                    confirm: labels.confirmDelete,
                    errorDefault: labels.errorDefault,
                  }}
                />
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-nordic/50 dark:text-gray-400">
                {labels.noResults}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
