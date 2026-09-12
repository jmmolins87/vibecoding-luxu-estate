import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuxeEstate — Find your sanctuary",
  description:
    "Premium real estate app: curated villas, penthouses and homes for sale and rent.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
