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
  /**
   * Colección de imágenes de la propiedad (mínimo 4: principal + 3 adicionales).
   * `images[0]` es siempre la foto principal (portada, tarjetas y Open Graph).
   */
  images: string[];
  imagesAlt: string[];
  description: string;
  amenities: string[];
  agent: PropertyAgent;
  coordinates: PropertyCoordinates;
  tag?: "Exclusive" | "New Arrival" | "Premium" | "New";
  featured?: boolean;
}

const localeMap: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

export function formatPrice(
  property: Pick<Property, "price" | "priceSuffix">,
  locale = "en",
): string {
  const intlLocale = localeMap[locale] ?? "en-US";
  const formatted = new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);
  return property.priceSuffix ? `${formatted}${property.priceSuffix}` : formatted;
}
