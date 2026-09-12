-- Migración: crea la tabla `properties` para Luxe Estate
-- Ejecútala desde el MCP de Supabase (ya sin --read-only) o desde el SQL Editor.
-- Ids de tipo TEXT para reutilizar los slugs del mock actual (glass-pavilion, etc.).

create table if not exists public.properties (
  id text primary key,
  title text not null,
  location text not null,
  address text not null,
  price numeric not null,
  price_suffix text,
  type text not null check (type in ('House', 'Apartment', 'Villa', 'Penthouse')),
  status text not null check (status in ('sale', 'rent')),
  beds integer not null default 0,
  baths numeric not null default 0,
  area numeric not null default 0,
  image text not null,
  image_alt text not null,
  tag text check (tag in ('Exclusive', 'New Arrival')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- Índices para la paginación y filtros del HomeScreen
create index if not exists properties_created_at_idx on public.properties (created_at desc);
create index if not exists properties_featured_idx on public.properties (featured) where featured = true;
create index if not exists properties_status_idx on public.properties (status);
create index if not exists properties_type_idx on public.properties (type);

-- Lectura pública (la app usa la anon key en el servidor para paginar)
alter table public.properties enable row level security;

drop policy if exists "properties_select_public" on public.properties;
create policy "properties_select_public"
  on public.properties for select
  to anon, authenticated
  using (true);

-- Datos iniciales (2 destacadas + 16 novedades = 18 propiedades)
insert into public.properties
  (id, title, location, address, price, price_suffix, type, status, beds, baths, area, image, image_alt, tag, featured)
values
  ('glass-pavilion', 'The Glass Pavilion', 'Beverly Hills, California', '1201 Laurel Way, Beverly Hills', 5250000, null, 'Villa', 'sale', 5, 4.5, 4200, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', 'Luxury modern villa exterior with pool', 'Exclusive', true),
  ('azure-heights', 'Azure Heights Penthouse', 'Downtown, Vancouver', '889 Pacific St, Vancouver', 3800000, null, 'Penthouse', 'sale', 3, 3, 2100, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', 'Modern interior living room with view', 'New Arrival', true),
  ('modern-family-home', 'Modern Family Home', 'Seattle', '123 Pine St, Seattle', 850000, null, 'House', 'sale', 3, 2, 120, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80', 'Modern white house facade', null, false),
  ('urban-loft', 'Urban Loft', 'Portland', '456 Elm Ave, Portland', 3200, '/mo', 'Apartment', 'rent', 1, 1, 85, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', 'Stylish apartment living room', null, false),
  ('highland-retreat', 'Highland Retreat', 'Bend', '789 Mountain Rd, Bend', 620000, null, 'House', 'sale', 2, 2, 98, 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80', 'Cabin in the woods exterior', null, false),
  ('sea-view-penthouse', 'Sea View Penthouse', 'Miami', '321 Ocean Dr, Miami', 4500, '/mo', 'Penthouse', 'rent', 3, 3, 180, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', 'Bright bedroom with large window', null, false),
  ('central-studio', 'Central Studio', 'Chicago', '555 Main St, Chicago', 550000, null, 'Apartment', 'sale', 1, 1, 50, 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80', 'Cozy apartment interior', null, false),
  ('garden-villa', 'Garden Villa', 'Austin', '999 Oak Ln, Austin', 2800, '/mo', 'Villa', 'rent', 2, 2, 110, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 'Modern minimalist home exterior', null, false),
  ('sunset-ridge-villa', 'Sunset Ridge Villa', 'Los Angeles', '742 Sunset Ridge Dr, Los Angeles', 1950000, null, 'Villa', 'sale', 4, 3.5, 320, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', 'Luxury villa with pool at dusk', null, false),
  ('palm-court-estate', 'Palm Court Estate', 'Palm Springs', '18 Palm Court Dr, Palm Springs', 2400000, null, 'House', 'sale', 5, 4, 410, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', 'Modern estate with pool and palm trees', null, false),
  ('meridian-sky-loft', 'Meridian Sky Loft', 'New York', '77 Lexington Ave, New York', 5200, '/mo', 'Apartment', 'rent', 2, 2, 135, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', 'Bright loft apartment interior', null, false),
  ('lakeview-modern-house', 'Lakeview Modern House', 'Denver', '204 Lakeview Cir, Denver', 975000, null, 'House', 'sale', 4, 3, 260, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80', 'Modern house kitchen and living space', null, false),
  ('coral-bay-residence', 'Coral Bay Residence', 'San Diego', '310 Coral Bay Ave, San Diego', 1350000, null, 'House', 'sale', 3, 2.5, 210, 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80', 'Suburban house with garage exterior', null, false),
  ('downtown-design-apartment', 'Downtown Design Apartment', 'San Francisco', '88 Market St, San Francisco', 3900, '/mo', 'Apartment', 'rent', 2, 1, 95, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80', 'Open plan apartment living room', null, false),
  ('white-oak-villa', 'White Oak Villa', 'Dallas', '45 White Oak Trl, Dallas', 890000, null, 'Villa', 'sale', 4, 3, 285, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', 'Elegant white villa facade', null, false),
  ('harbor-light-penthouse', 'Harbor Light Penthouse', 'Boston', '1 Harbor Light Way, Boston', 6800, '/mo', 'Penthouse', 'rent', 3, 2.5, 195, 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=800&q=80', 'Penthouse living room with city view', null, false),
  ('cedar-grove-house', 'Cedar Grove House', 'Nashville', '612 Cedar Grove Rd, Nashville', 720000, null, 'House', 'sale', 3, 2, 185, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80', 'Modern house exterior with garage', null, false),
  ('marina-sky-penthouse', 'Marina Sky Penthouse', 'Miami', '900 Marina Blvd, Miami', 2950000, null, 'Penthouse', 'sale', 4, 4, 310, 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80', 'Luxury penthouse interior with large windows', null, false)
on conflict (id) do update set
  title = excluded.title,
  location = excluded.location,
  address = excluded.address,
  price = excluded.price,
  price_suffix = excluded.price_suffix,
  type = excluded.type,
  status = excluded.status,
  beds = excluded.beds,
  baths = excluded.baths,
  area = excluded.area,
  image = excluded.image,
  image_alt = excluded.image_alt,
  tag = excluded.tag,
  featured = excluded.featured;
