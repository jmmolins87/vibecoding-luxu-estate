import Loader from "@/components/ui/Loader";

/**
 * Fallback de Suspense para la home (`app/page.tsx`) durante
 * navegación por filtros / paginación / búsqueda (server re-render).
 * Evita que la UI parezca congelada mientras Supabase responde.
 */
export default function HomeLoading() {
  return (
    <div className="min-h-full bg-clearday font-display text-nordic antialiased dark:bg-[#0f231f]">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-50 h-20 border-b border-nordic/10 bg-clearday/95 dark:bg-[#0f231f]/95">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-nordic/10" />
          <div className="hidden gap-6 md:flex">
            <div className="h-4 w-12 animate-pulse rounded bg-nordic/10" />
            <div className="h-4 w-12 animate-pulse rounded bg-nordic/10" />
            <div className="h-4 w-12 animate-pulse rounded bg-nordic/10" />
          </div>
          <div className="h-9 w-9 animate-pulse rounded-full bg-nordic/10" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero skeleton */}
        <div className="mx-auto max-w-3xl space-y-6 py-8 text-center">
          <div className="mx-auto h-10 w-64 animate-pulse rounded-lg bg-nordic/10" />
          <div className="h-14 w-full animate-pulse rounded-xl bg-white dark:bg-white/5" />
          <div className="flex justify-center gap-3">
            <div className="h-8 w-16 animate-pulse rounded-full bg-nordic/10" />
            <div className="h-8 w-20 animate-pulse rounded-full bg-nordic/10" />
            <div className="h-8 w-16 animate-pulse rounded-full bg-nordic/10" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 py-12">
          <Loader size="lg" label="Cargando propiedades..." />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-xl bg-white p-0 shadow-card dark:bg-white/5"
            >
              <div className="aspect-4/3 bg-nordic/10" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-24 rounded bg-nordic/10" />
                <div className="h-4 w-full rounded bg-nordic/10" />
                <div className="h-3 w-2/3 rounded bg-nordic/10" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
