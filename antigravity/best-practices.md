# Best Practices — Luxe Estate (Next.js + Bienes Raíces)

Guía de buenas prácticas, recomendaciones e ideas para aplicaciones Next.js dedicadas a la venta de bienes raíces. Aplica a este proyecto (Luxe Estate) y sirve como referencia para futuras apps inmobiliarias.

---

## 1. Arquitectura y estrategia de renderizado

- **Server Components por defecto**: renderiza listados, detalle de propiedad y páginas de marketing en el servidor. Añade `'use client'` solo a islas interactivas (filtros, mapa, modales, carruseles).
- **ISR con revalidación bajo demanda**: usa `revalidate: 60` para listados + revalidación on-demand vía webhook del CMS cuando cambia el estado (venta → reservada → vendida).
- **Generación estática para marketing**: home, nosotros, contacto y landing pages por localidad se pre-renderizan en build con `generateStaticParams`.
- **Híbrido SSR/CSR**: el servidor entrega el HTML inicial; solo se hidratan los componentes interactivos. En este proyecto: `app/page.tsx` es Server Component y `HomeScreen` solo hidrata lo necesario.
- **Convenciones del App Router**: coloca `loading.tsx` y `error.tsx` por segmento (ej. `/properties/loading.tsx` con skeletons de tarjetas).
- **Coloca componentes junto a sus rutas**: `components/home/*` para la home, y crea subcarpetas por página (`components/property/*`, `components/search/*`).
- **Streaming con Suspense**: envuelve secciones lentas (mapa, recomendaciones) en `<Suspense fallback={...}>` para que el resto pinte antes.

```tsx
// Ejemplo: página de detalle con streaming
export default function PropertyPage({ params }: { params: { id: string } }) {
  return (
    <>
      <PropertyGallery id={params.id} /> {/* Server Component, rápido */}
      <Suspense fallback={<MapSkeleton />}>
        <PropertyMap id={params.id} /> {/* lento: hace streaming */}
      </Suspense>
    </>
  );
}
```

---

## 2. Optimización de rendimiento

- **JS mínimo en páginas de marketing**: objetivo < 10 KB de JS comprimido en home/listados; hidrata solo búsqueda, carrusel y CTA de contacto.
- **Una fuente, dos pesos**: SF Pro Display (ya configurado en `app/globals.css`) con `font-display: swap` y solo los pesos necesarios (400 y 600).
- **`next/image` en todas las fotos**: `priority` en la imagen hero/LCP, atributo `sizes` correcto por viewport (no `100vw` para thumbnails de 200 px), formatos AVIF/WebP automáticos.
- **Optimiza en subida, no en petición**: hook del CMS que genera variantes (400/800/1200/1920 px) en WebP/AVIF y las guarda en Supabase Storage o Vercel Blob.
- **Tailwind v4 con `@theme`**: tokens de diseño como variables CSS (ya hecho en `globals.css`: `--color-nordic`, `--color-mosque`, etc.). El JIT solo emite las clases usadas (~8 KB gzip).
- **Cero scripts de terceros en la ruta crítica**: carga GA4/analytics solo tras la primera interacción (scroll, click o focus). Usa Vercel Analytics (first-party).
- **Prefetch automático de Next 15+**: no escribas lógica de prefetch personalizada; `Link` ya precarga rutas en viewport.
- **Objetivos Core Web Vitals**: LCP < 1.2 s, TBT 0 ms, CLS 0, FCP < 0.5 s. Mide con Lighthouse móvil en cada PR.

```tsx
// sizes correcto según el contexto
<Image src={p.image} alt={p.imageAlt} width={400} height={300} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
// Hero/LCP: priority
<Image src={hero} alt="..." fill priority sizes="100vw" />
```

---

## 3. Data fetching y manejo de estado

- **Deduplica con `cache()` de React**: ya implementado en `lib/properties.ts` (`getFeaturedProperties`, `getPaginatedProperties`). Toda función de lectura del servidor debe usarlo.
- **Cliente Supabase solo en el servidor**: `createServerSupabaseClient()` en Server Components / Server Actions / Route Handlers. El navegador nunca toca la BD directamente.
- **Paginación con `range()` + `count: exact`**: ya implementado en `lib/properties.ts:112`. Nunca traigas la tabla completa para paginar en cliente.
- **Consultas concurrentes con `Promise.all`**: destacadas + paginadas en paralelo (ya hecho en `app/page.tsx:34`).
- **URL como única fuente de verdad**: filtros, página y orden viven en `searchParams`. Cada vista filtrada es una URL compartible e indexable.
- **Fallback a datos locales**: si Supabase no responde, sirve datos locales con `fromSupabase: false` (ya implementado). Degradación elegante > pantalla rota.
- **Índices compuestos en BD**: indexa las columnas por las que más se filtra (`city + type + status`, `price`, `bedrooms`).
- **Persistencia de filtros**: sincroniza URL + `localStorage` para usuarios recurrentes.
- **Imágenes como URLs a CDN**: guarda array de URLs (Supabase Storage público), nunca binarios en la BD.

```ts
// Patrón de filtro server-side (ya usado en lib/properties.ts)
const { data, error } = await supabase
  .from("properties")
  .select("*", { count: "exact" })
  .eq("featured", false)
  .gte("price", minPrice)
  .order("created_at", { ascending: false })
  .range(from, to);
```

---

## 4. SEO y datos estructurados

- **Metadata API por ruta**: `generateMetadata()` dinámico en cada detalle de propiedad (título, descripción, Open Graph, Twitter Cards).
- **JSON-LD `RealEstateListing` en cada propiedad**: precio, dirección, habitaciones, tipo, imágenes y contacto del agente. Sube el CTR orgánico ~18 %.

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  name: property.title,
  address: { "@type": "PostalAddress", streetAddress: property.address, addressLocality: property.location },
  offers: { "@type": "Offer", price: property.price, priceCurrency: "USD" },
  numberOfBedrooms: property.beds,
  image: [property.image],
})}} />
```

### 4.1. Metadata y Open Graph en `[slug]/page.tsx` (para compartir en WhatsApp/redes)

- **Inyectar título, precio y foto principal en `generateMetadata()`**: cada página de detalle (`app/property/[slug]/page.tsx`) debe generar sus propios metatags desde los datos de la propiedad, para que al compartir el enlace en WhatsApp, X, Facebook o Telegram se vea una tarjeta rica con foto, precio y título.
- **Título con precio incluido**: el `og:title` debe llevar el precio formateado, ej. `"The Glass Pavilion — $5,250,000 | LuxeEstate"`. WhatsApp muestra título + descripción + imagen; el precio en el título es lo que más convierte.
- **Foto principal como `og:image`**: usa la imagen destacada de la propiedad (`property.image`). Tamaño ideal 1200×630 px; mínimo aceptado por scrapers 300×200 px.
- **URLs ABSOLUTAS obligatorias**: los scrapers de WhatsApp/redes no resuelven rutas relativas. Si la imagen es local (`/images/...`), conviértela a absoluta con la URL del sitio. Configura `metadataBase` en `app/layout.tsx` para que Next.js lo haga automáticamente:

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  // ...
};
```

- **Ejemplo completo de `generateMetadata` para el detalle**:

```tsx
// app/property/[slug]/page.tsx
import type { Metadata } from "next";
import { getPropertyBySlug } from "@/lib/properties";
import { formatPrice } from "@/types/property";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  // Fallback si el slug no existe: metatags genéricos, nunca vacíos
  if (!property) return { title: "Propiedad no encontrada | LuxeEstate" };

  const title = `${property.title} — ${formatPrice(property)}`;
  const description = `${property.type} en ${property.status === "sale" ? "venta" : "alquiler"} en ${property.location}: ${property.beds} hab, ${property.baths} baños, ${property.area} m².`;

  return {
    title: `${title} | LuxeEstate`,
    description,
    alternates: { canonical: `/property/${property.id}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/property/${property.id}`,
      images: [{ url: property.image, width: 1200, height: 630, alt: property.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [property.image],
    },
  };
}
```

- **Recomendaciones adicionales**:
  - La página debe ser **Server Component** para que los metatags se rendericen en el HTML del servidor (los scrapers no ejecutan JavaScript).
  - Usa `summary_large_image` en Twitter/X para foto grande; sin esto la tarjeta sale pequeña.
  - Incluye `og:locale` (`es_ES` / `en_US`) si la app es multi-idioma.
  - Verifica cada cambio con los validadores: [Meta Sharing Debugger](https://developers.facebook.com/tools/debug/), [X Card Validator](https://cards-dev.twitter.com/validator) y enviándote el enlace por WhatsApp.
  - Las imágenes de Unsplash/CDN ya son absolutas y sirven directamente; solo las rutas locales `/...` necesitan `metadataBase` o resolución manual.
  - Si el precio cambia, la tarjeta compartida se actualiza sola (los scrapers re-leen los metatags en cada envío); no hace falta versionar URLs.

- **Landing pages por localidad**: rutas tipo `/venta/casas-madrid` con comentario de mercado único, gráfico de precio/m² y listados vivos. Son multiplicadores SEO a 12 meses.
- **Sitemap + robots**: genera `sitemap.xml` con `generateStaticParams` (marketing + top listados) y revalida con ISR.
- **URLs canónicas**: evita contenido duplicado en vistas filtradas/paginadas (`?page=2&status=sale` → canonical a la vista base cuando aplique).
- **Nunca fotos sin `alt` descriptivo**: `alt={`${title} — foto ${i}`}` mejora SEO de imágenes y accesibilidad.

---

## 5. Funcionalidades específicas de bienes raíces

- **Mapbox GL JS sobre Google Maps**: vector tiles a 60 fps, clustering de miles de pines, draw-to-search (dibujar polígono), estilos custom con la marca. Hidrátalo solo en cliente y con lazy-load bajo el fold.
- **PostGIS para búsqueda geoespacial**: función RPC `search_listings_nearby` con `ST_DWithin` (radio) + `ST_Distance` (orden por proximidad). Índice espacial GiST en `(latitude, longitude)`.
- **Autocompletado de ubicación**: Mapbox Search API o Google Places con debounce de 150 ms; tabla postcode→coordenadas para búsqueda instantánea sin round-trip de geocoding.
- **Búsqueda avanzada en URL**: rango de precio, habitaciones, baños, tipo, estado, superficie, m² — todo serializado en `searchParams`.
- **Opciones de orden**: más recientes, precio ↑/↓, mayor descuento %, más cercanas (Geolocation API con fallback al centroide del código postal).
- **Detalle de propiedad que convierte**: galería full-width above the fold, formulario de contacto del agente a ≤ 1 scroll del hero, calculadora hipotecaria con enganche y tasa ajustables.
- **Precios en los pines del mapa**: muestra el precio formateado en cada marcador (con `Intl.NumberFormat`), no un pin genérico. Es el dato que más escanea el comprador.
- **Favoritos con optimistic UI**: toggle corazón + Server Action; actualiza la UI al instante y revierte si falla (React Query o `useOptimistic`).
- **Formularios de contacto con anti-spam**: Server Actions + Cloudflare Turnstile (mejor UX que reCAPTCHA), validación en cliente y servidor, emails vía Resend/Postmark.
- **Botón WhatsApp sin widget**: un simple `<a href="https://wa.me/...">` — cero JS, cero peticiones hasta el tap.

---

## 6. UI/UX y sistema de diseño

- **Paleta exacta del proyecto** (`antigravity/guidelines.md`):
  - Fondo principal: Clear Day `#EEF6F6`
  - Botones primarios: Mosque `#006655`
  - Headers/navegación y texto: Nordic `#19322F`
  - Tarjetas destacadas: Hint of Green `#D9ECC8`
  - Tipografía obligatoria: SF Pro Display
- **Componentes reutilizables**: una sola `PropertyCard` (foto, precio, ubicación, stats, badge de estado, tag Exclusive/New Arrival) usada en home, búsqueda y favoritos. Crear componente para todo lo que se repita.
- **Mobile-first**: sidebar de filtros como `Sheet` en móvil, grid `1 → 2 → 3/4` columnas por breakpoint. El 68 % del tráfico inmobiliario es móvil.
- **Accesibilidad**: HTML semántico, `aria-hidden` en overlays decorativos, labels en marcadores del mapa, `tel:+34...` en formato internacional, gestión de foco en modales.
- **Skeletons, no spinners**: tarjetas esqueleto durante la carga; placeholder para listados sin foto (una imagen rota destruye el grid).
- **Estados vacíos útiles**: "Sin resultados" + botón "Limpiar filtros" que navega a `/listings` sin params.
- **Hero sin blur**: foto real de propiedad, nítida, full-bleed, con gradiente sutil para contraste del texto. El blur desperdicia el slot más valioso.
- **Formato de moneda con `Intl.NumberFormat`**: ya implementado en `types/property.ts:23` (`formatPrice`). Respeta comas, decimales y símbolos por locale.

---

## 7. Experiencia de desarrollo (DX)

- **TypeScript estricto**: tipa todo el dominio (`types/property.ts`: `Property`, `PropertyType`, `PropertyStatus`). Genera tipos desde Supabase/OpenAPI para sincronizar frontend ↔ backend.
- **ESLint + import order**: `eslint-config-next`, plugin de Tailwind, `organize-imports` en el editor.
- **Tests unitarios**: Jest + React Testing Library para `formatPrice`, lógica de filtros/paginación y `PropertyCard`.
- **Tests E2E**: Playwright para flujo de búsqueda → detalle → contacto.
- **Bundle analyzer en CI**: `@next/bundle-analyzer` para detectar regresiones de peso.
- **Storybook**: documenta `PropertyCard`, `HeroSearch`, `MarketTabs` aislados.
- **Seed con datos realistas**: `prisma/seed.ts` o script Supabase con tipos, rangos y coordenadas reales variados. Comando `db:seed` en `package.json`.
- **No instalar librerías sin consultar**: regla vigente del proyecto (`antigravity/guidelines.md`). Proponer primero, instalar después.

---

## 8. Seguridad y autenticación

- **Supabase Auth**: email/password + magic link para compradores; roles `buyer / agent / admin` con control de acceso por rol.
- **Row Level Security (RLS)**: políticas en `properties`, `inquiries`, `favorites`, `saved_searches`. Lectura pública solo para `status = ACTIVE`.
- **Mutaciones vía Server Actions**: crear listado, guardar favorito, enviar consulta. Sin llamadas API desde el cliente.
- **Validación de uploads**: tipo/tamaño en cliente y servidor; bucket público `listing-images` con política `SELECT` pública; drag-and-drop con `react-dropzone` + preview inmediato vía object URLs.
- **Rate limiting**: middleware Edge en formularios de contacto/consulta.
- **Headers de seguridad**: CSP en `next.config.ts` para dominios de mapas, fuentes y analytics.
- **Pooling de conexiones**: PgBouncer/pool de Prisma — las serverless functions no mantienen conexiones persistentes y agotan el límite de Postgres en picos de tráfico.

---

## 9. Despliegue y monitoreo

- **Vercel Pro**: edge caching, preview deployments por PR, ISR, analytics first-party.
- **Bases separadas por entorno**: producción vs. preview — los previews nunca escriben en producción.
- **Migraciones en CI**: ejecuta migraciones (Prisma/Supabase CLI) antes del deploy; prueba migraciones en preview primero.
- **Estrategia de rollback**: rollback instantáneo de Vercel + scripts `down` de migración documentados.
- **Error tracking**: Sentry o Vercel Observability para errores de servidor y cliente.
- **Analítica respetuosa**: Plausible/Fathom (GDPR-friendly, ligeros) + eventos custom en Postgres (vistas por propiedad, fuente de lead que convierte).
- **Alertas de listings obsoletos**: el 39 % de usuarios pierde confianza al ver "En venta" algo ya vendido. Sincronización nocturna BD ↔ feed + revalidación on-demand inmediata al cambiar estado.
- **Tráfico con picos**: las inmobiliarias tienen picos en fin de semana — autoscaling en Edge + caché agresiva en listados (nadie decide una compra por un listado de hace 2 min; ISR de 5–60 min es suficiente).

---

## 10. Ideas y roadmap sugerido

- [ ] Calculadora hipotecaria en cada detalle (enganche + tasa ajustables).
- [ ] Búsqueda por dibujo en mapa (polígono) con Mapbox Draw.
- [ ] Alertas de búsqueda guardada por email (Edge Function + Resend).
- [ ] Comparador de propiedades lado a lado (2–3 listings).
- [ ] Tour virtual / galería 360° en propiedades premium.
- [ ] Gráfico de historial de precio por propiedad (bajadas destacadas con badge "% reducido").
- [ ] Páginas de agente con sus listings, rating y contacto directo.
- [ ] Modo oscuro con swap de variables CSS (`@custom-variant dark`, ya preparado en `globals.css:18`).
- [ ] PWA instalable para agentes (revisar listings entre visitas).
- [ ] API-first: exponer Route Handlers JSON para una futura app móvil React Native sin reescribir backend.

---

*Última actualización: septiembre 2026. Revisar cada 6–12 meses: schema de contenido, dependencias y Core Web Vitals.*
