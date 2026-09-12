"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyMapProps {
  lat: number;
  lng: number;
  title: string;
}

/**
 * Client island: mapa Leaflet con tiles de OpenStreetMap (gratuitos, sin API key).
 * Se carga con `next/dynamic` + `ssr: false` desde `PropertyMapWrapper`.
 * Nota: para producción con alto tráfico, usar un proveedor de tiles propio
 * (p. ej. CARTO con API key) según la tile usage policy de OSM.
 */
export default function PropertyMap({ lat, lng, title }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView([lat, lng], 14);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const icon = L.divIcon({
      className: "luxe-estate-marker",
      html: `<div style="width:32px;height:32px;border-radius:9999px;background:#006655;border:4px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;">&#8962;</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([lat, lng], { icon }).addTo(map).bindPopup(title);

    return () => {
      map.remove();
    };
  }, [lat, lng, title]);

  return <div ref={containerRef} className="h-full w-full" role="img" aria-label={`Map showing ${title}`} />;
}
