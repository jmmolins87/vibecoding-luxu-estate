"use client";

import { useState } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import type { Property } from "@/types/property";

interface PropertyGalleryProps {
  property: Pick<Property, "images" | "imagesAlt" | "title" | "status" | "tag">;
}

/**
 * Client island: hero + tira de thumbnails + lightbox.
 * La imagen principal lleva `priority` (es el LCP de la página).
 */
export default function PropertyGallery({ property }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = () =>
    setActive((i) => (i - 1 + property.images.length) % property.images.length);
  const next = () => setActive((i) => (i + 1) % property.images.length);

  return (
    <>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group">
        <Image
          key={property.images[active]}
          src={property.images[active]}
          alt={property.imagesAlt[active]}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {property.tag && (
            <span className="rounded-full bg-mosque px-3 py-1.5 text-xs font-medium tracking-wider text-white uppercase shadow-sm">
              {property.tag}
            </span>
          )}
          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium tracking-wider text-nordic uppercase shadow-sm backdrop-blur">
            {property.status === "sale" ? "For Sale" : "For Rent"}
          </span>
        </div>
        <button
          onClick={() => setLightbox(true)}
          className="absolute right-4 bottom-4 flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-nordic shadow-lg backdrop-blur transition-all hover:bg-white"
        >
          <Icon name="grid" className="h-4 w-4" />
          View All Photos
        </button>
      </div>

      {property.images.length > 1 && (
        <div className="hide-scroll flex snap-x gap-4 overflow-x-auto pt-4 pb-2">
          {property.images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              className={`relative aspect-[4/3] w-48 flex-none snap-start overflow-hidden rounded-lg transition-opacity ${
                i === active
                  ? "ring-2 ring-mosque ring-offset-2 ring-offset-clearday dark:ring-offset-[#0f231f]"
                  : "cursor-pointer opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={property.imagesAlt[i]}
                fill
                sizes="192px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${property.title} photos`}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            aria-label="Close gallery"
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
          <button
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <div
            className="relative aspect-[16/10] w-full max-w-5xl overflow-hidden rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={property.images[active]}
              alt={property.imagesAlt[active]}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <button
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
          </button>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {active + 1} / {property.images.length}
          </span>
        </div>
      )}
    </>
  );
}
