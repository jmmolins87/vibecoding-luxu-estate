"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { categoryFilters } from "@/data/properties";
import FilterModal from "@/components/home/FilterModal";
import FilterChips from "@/components/home/FilterChips";
import { countActiveFilters, type PropertyFilters } from "@/lib/filters";

interface HeroSearchProps {
  filters: PropertyFilters;
  total: number;
}

export default function HeroSearch({ filters, total }: HeroSearchProps) {
  const [category, setCategory] = useState<string>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-3xl space-y-8 text-center">
        <h1 className="text-4xl leading-tight font-light text-nordic md:text-5xl lg:text-6xl dark:text-white">
          Find your{" "}
          <span className="relative inline-block">
            <span className="relative z-10 font-medium">sanctuary</span>
            <span className="absolute bottom-2 left-0 z-0 h-3 w-full -rotate-1 bg-mosque/20" />
          </span>
          .
        </h1>

        <div className="group relative mx-auto max-w-2xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Icon
              name="search"
              className="text-2xl text-nordic-muted transition-colors group-focus-within:text-mosque"
            />
          </div>
          <input
            type="text"
            placeholder="Search by city, neighborhood, or address..."
            className="block w-full rounded-xl border-none bg-white py-4 pr-4 pl-12 text-lg text-nordic shadow-soft transition-all placeholder-nordic-muted/60 focus:bg-white focus:ring-2 focus:ring-mosque dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
          />
          <button className="absolute inset-y-2 right-2 flex items-center justify-center rounded-lg bg-mosque px-6 font-medium text-white shadow-lg shadow-mosque/20 transition-colors hover:bg-mosque/90">
            Search
          </button>
        </div>

        <div className="hide-scroll -mx-4 flex items-center justify-center gap-3 overflow-x-auto px-4 py-2">
          {categoryFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setCategory(filter)}
              className={
                category === filter
                  ? "rounded-full bg-nordic px-5 py-2 text-sm font-medium whitespace-nowrap text-white shadow-lg shadow-nordic/10 transition-transform hover:-translate-y-0.5"
                  : "rounded-full border border-nordic/5 bg-white px-5 py-2 text-sm font-medium whitespace-nowrap text-nordic-muted transition-all hover:border-mosque/50 hover:bg-mosque/5 hover:text-nordic dark:bg-white/5"
              }
            >
              {filter}
            </button>
          ))}
          <div className="mx-2 h-6 w-px bg-nordic/10" />
          <button
            onClick={() => setFiltersOpen(true)}
            className="relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap text-nordic transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
          >
            <Icon name="tune" className="h-4 w-4" /> Filters
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mosque text-[11px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <FilterChips filters={filters} />
      </div>

      <FilterModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        total={total}
      />
    </section>
  );
}
