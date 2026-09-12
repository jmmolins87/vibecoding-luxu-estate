"use client";

import dynamic from "next/dynamic";
import MapSkeleton from "@/components/property/MapSkeleton";

const PropertyMapNoSsr = dynamic(
  () => import("@/components/property/PropertyMap"),
  { ssr: false, loading: () => <MapSkeleton /> },
);

interface PropertyMapWrapperProps {
  lat: number;
  lng: number;
  title: string;
}

/** Client wrapper: permite `ssr: false` (no permitido en Server Components). */
export default function PropertyMapWrapper({
  lat,
  lng,
  title,
}: PropertyMapWrapperProps) {
  return <PropertyMapNoSsr lat={lat} lng={lng} title={title} />;
}
