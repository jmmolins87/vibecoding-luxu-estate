"use client";

import { useState } from "react";
import { newInMarketProperties } from "@/data/properties";
import PropertyCard from "@/components/home/PropertyCard";

const tabs = ["All", "Buy", "Rent"] as const;
type Tab = (typeof tabs)[number];

export default function NewInMarket() {
  const [tab, setTab] = useState<Tab>("All");

  const filtered =
    tab === "All"
      ? newInMarketProperties
      : newInMarketProperties.filter((p) =>
          tab === "Buy" ? p.status === "sale" : p.status === "rent",
        );

  return (
    <section>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-light text-nordic dark:text-white">
            New in Market
          </h2>
          <p className="mt-1 text-sm text-nordic-muted">
            Fresh opportunities added this week.
          </p>
        </div>
        <div className="hidden rounded-lg bg-white p-1 md:flex dark:bg-white/5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                tab === t
                  ? "rounded-md bg-nordic px-4 py-1.5 text-sm font-medium text-white shadow-sm"
                  : "rounded-md px-4 py-1.5 text-sm font-medium text-nordic-muted hover:text-nordic dark:hover:text-white"
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <button className="rounded-lg border border-nordic/10 bg-white px-8 py-3 font-medium text-nordic transition-all hover:border-mosque hover:text-mosque hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white">
          Load more properties
        </button>
      </div>
    </section>
  );
}
