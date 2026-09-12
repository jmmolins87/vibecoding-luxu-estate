/**
 * Skeleton para el mapa (fallback de Suspense / dynamic loading).
 * Skeletons, no spinners (best-practices §6).
 */
export default function MapSkeleton() {
  return (
    <div className="relative aspect-[4/3] w-full animate-pulse overflow-hidden rounded-lg bg-nordic/10 dark:bg-white/10">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-white bg-mosque/60" />
      </div>
    </div>
  );
}
