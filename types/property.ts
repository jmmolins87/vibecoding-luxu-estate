export type PropertyType = "House" | "Apartment" | "Villa" | "Penthouse";

export type PropertyStatus = "sale" | "rent";

export interface PropertyAgent {
  name: string;
  photo: string;
  rating: string;
  phone: string;
  whatsapp: string;
}

export interface PropertyCoordinates {
  lat: number;
  lng: number;
}

export interface Property {
  id: string;
  /** URL amigable y única, ej. "glass-pavilion-beverly-hills" */
  slug: string;
  title: string;
  location: string;
  address: string;
  price: number;
  priceSuffix?: string;
  type: PropertyType;
  status: PropertyStatus;
  beds: number;
  baths: number;
  area: number;
  garage: number;
  /** Compatibilidad: siempre equivale a `images[0]` */
  image: string;
  /** Compatibilidad: siempre equivale a `imagesAlt[0]` */
  imageAlt: string;
  /** Colección de 1 a N imágenes de la propiedad */
  images: string[];
  imagesAlt: string[];
  description: string;
  amenities: string[];
  agent: PropertyAgent;
  coordinates: PropertyCoordinates;
  tag?: "Exclusive" | "New Arrival" | "Premium" | "New";
  featured?: boolean;
}

export function formatPrice(property: Pick<Property, "price" | "priceSuffix">): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);
  return property.priceSuffix ? `${formatted}${property.priceSuffix}` : formatted;
}
