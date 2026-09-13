"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Icon from "@/components/ui/Icon";
import PropertyCard from "@/components/home/PropertyCard";
import { useSaved } from "@/components/saved/SavedProvider";
import type { Property } from "@/types/property";

interface Labels {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDesc: string;
  browse: string;
}

/**
 * Grid de favoritos con filtrado en vivo: al quitar el corazón,
 * la tarjeta desaparece sin recargar (estado de `SavedProvider`).
 */
export default function SavedGrid({
  properties,
  labels,
}: {
  properties: Property[];
  labels: Labels;
}) {
  const { savedIds } = useSaved();
  const visible = properties.filter((p) => savedIds.has(p.id));

  return (
    <div className="min-h-full bg-clearday font-display text-nordic antialiased selection:bg-mosque selection:text-white dark:bg-[#0f231f] dark:text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">{labels.title}</h1>
        <p className="mt-2 text-nordic/60 dark:text-gray-400">{labels.subtitle}</p>

        {visible.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-nordic/10 bg-white px-6 py-16 text-center shadow-soft dark:border-white/10 dark:bg-white/5">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mosque/10 text-mosque dark:text-hint">
              <Icon name="heart" className="h-7 w-7" />
            </span>
            <h2 className="text-xl font-semibold">{labels.emptyTitle}</h2>
            <p className="mt-2 max-w-sm text-sm text-nordic/60 dark:text-gray-400">
              {labels.emptyDesc}
            </p>
            <Link
              href="/"
              className="mt-6 rounded-lg bg-mosque px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-mosque/90 hover:shadow-soft"
            >
              {labels.browse}
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
