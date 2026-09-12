export type PropertyType = "House" | "Apartment" | "Villa" | "Penthouse";

export type PropertyStatus = "sale" | "rent";

export interface Property {
  id: string;
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
  image: string;
  imageAlt: string;
  tag?: "Exclusive" | "New Arrival";
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
