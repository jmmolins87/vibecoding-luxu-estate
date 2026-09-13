"use server";

/**
 * Geocodifica "dirección, ciudad" con Nominatim (OpenStreetMap).
 * Se ejecuta en el servidor para fijar un User-Agent propio
 * (política de uso de Nominatim) y no exponer la búsqueda al cliente.
 * Devuelve null si no hay resultados o la query es muy corta.
 */
export async function geocodeAddress(
  query: string,
): Promise<{ lat: number; lng: number } | null> {
  const q = query.trim();
  if (q.length < 4) return null;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`,
    {
      headers: {
        "User-Agent": "LuxeEstateAdmin/1.0 (property geocoding)",
        "Accept-Language": "en",
      },
      next: { revalidate: 60 * 60 * 24 },
    },
  );
  if (!res.ok) return null;

  const data: unknown = await res.json();
  const first = Array.isArray(data) ? data[0] : null;
  if (!first || typeof first !== "object") return null;
  const lat = Number((first as { lat?: unknown }).lat);
  const lng = Number((first as { lon?: unknown }).lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
