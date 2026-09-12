"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

interface AboutSectionProps {
  description: string;
}

/** Client island mínima: colapsa la descripción larga con "Read more". */
export default function AboutSection({ description }: AboutSectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!description) return null;

  return (
    <section className="rounded-xl border border-mosque/5 bg-white p-8 shadow-sm dark:bg-white/5">
      <h2 className="mb-4 text-lg font-semibold text-nordic dark:text-white">
        About this home
      </h2>
      <p
        className={`leading-relaxed text-nordic/70 dark:text-gray-300 ${expanded ? "" : "line-clamp-3"}`}
      >
        {description}
      </p>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 flex items-center gap-1 text-sm font-semibold text-mosque transition-all hover:gap-2"
      >
        {expanded ? "Show less" : "Read more"}
        <Icon
          name="arrow"
          className={`h-4 w-4 transition-transform ${expanded ? "-rotate-90" : "rotate-90"}`}
        />
      </button>
    </section>
  );
}
