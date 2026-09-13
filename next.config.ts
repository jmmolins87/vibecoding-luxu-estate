import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // La galería sube imágenes de hasta 25 MB vía Server Actions
    // (el límite por defecto es solo 1 MB).
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
