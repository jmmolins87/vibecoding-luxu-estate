-- Migración 003: campos de la ficha de propiedad individual
-- Ejecútala en el SQL Editor de Supabase (la anon key no tiene permisos DDL).
--
-- Añade: slug (URL amigable), garage, images/images_alt (colección 1..N),
-- description, amenities, agent (jsonb) y lat/lng (Leaflet),
-- y rellena las 18 propiedades existentes.

alter table public.properties
  add column if not exists slug text,
  add column if not exists garage integer not null default 0,
  add column if not exists images text[],
  add column if not exists images_alt text[],
  add column if not exists description text not null default '',
  add column if not exists amenities text[] not null default '{}',
  add column if not exists agent jsonb,
  add column if not exists lat double precision,
  add column if not exists lng double precision;

create unique index if not exists properties_slug_uidx
  on public.properties (slug);

-- El tag admite los badges del diseño ('Premium', 'New')
alter table public.properties drop constraint if exists properties_tag_check;
alter table public.properties
  add constraint properties_tag_check
  check (tag in ('Exclusive', 'New Arrival', 'Premium', 'New'));

-- Agente por defecto para todas las filas
update public.properties
  set agent = '{"name": "Sarah Jenkins", "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80", "rating": "Top Rated Agent", "phone": "+13105550142", "whatsapp": "https://wa.me/13105550142"}'::jsonb
  where agent is null or (agent->>'name') is null;

-- Backfill por propiedad (coords verificadas en tierra firme)
update public.properties set
  slug = 'glass-pavilion-beverly-hills', garage = 3,
  images = array[image,
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Open plan living room with floor-to-ceiling glass',
    'Designer kitchen with island',
    'Primary suite with garden view'],
  description = $$Experience modern luxury in this architecturally stunning glass pavilion in the heart of Beverly Hills. Floor-to-ceiling glass walls flood the interiors with natural light and open onto resort-style outdoor living with pool, spa and guest house.$$,
  amenities = array['Swimming Pool', 'Smart Home System', 'Private Gym', 'Wine Cellar', 'Central Heating & Cooling', 'Electric Vehicle Charging'],
  lat = 34.0736, lng = -118.4004
  where id = 'glass-pavilion';

update public.properties set
  slug = 'azure-heights-penthouse-vancouver', garage = 2,
  images = array[image,
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Lounge with panoramic city views',
    'Dining area with designer lighting',
    'Chef kitchen with marble finishes'],
  description = $$Perched above downtown Vancouver, this penthouse pairs skyline views with refined interiors. An open living plan, wraparound terrace and private elevator lobby make it the most coveted address in the city.$$,
  amenities = array['Rooftop Terrace', 'Concierge Service', 'Private Gym', 'Smart Home System', 'Wine Cellar', 'Electric Vehicle Charging'],
  lat = 49.2827, lng = -123.1207
  where id = 'azure-heights';

update public.properties set
  slug = 'modern-family-home-seattle', garage = 1,
  images = array[image,
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Kitchen and living space',
    'Bright family living room',
    'Bedroom with natural light'],
  description = $$A light-filled family home minutes from downtown Seattle. Updated kitchen, flexible living spaces and a low-maintenance garden make it ideal for modern family life.$$,
  amenities = array['Central Heating & Cooling', 'Garden', 'Smart Home System', 'Laundry Room'],
  lat = 47.6062, lng = -122.3321
  where id = 'modern-family-home';

update public.properties set
  slug = 'urban-loft-portland', garage = 1,
  images = array[image,
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Loft bedroom with large windows',
    'Compact modern kitchen'],
  description = $$Industrial-chic loft in the Portland arts district with exposed brick, high ceilings and oversized windows. Walk to galleries, cafes and transit.$$,
  amenities = array['High Ceilings', 'In-unit Laundry', 'Bike Storage', 'Pet Friendly'],
  lat = 45.5152, lng = -122.6784
  where id = 'urban-loft';

update public.properties set
  slug = 'highland-retreat-bend', garage = 1,
  images = array[image,
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Cozy wood-paneled living room',
    'Rustic dining corner'],
  description = $$A serene mountain retreat surrounded by pines. Vaulted cedar ceilings, a stone fireplace and a wraparound deck bring the outdoors in, all year round.$$,
  amenities = array['Fireplace', 'Wraparound Deck', 'Hot Tub', 'Mountain Views'],
  lat = 44.0582, lng = -121.3153
  where id = 'highland-retreat';

update public.properties set
  slug = 'sea-view-penthouse-miami', garage = 2,
  images = array[image,
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Living room with ocean view',
    'Designer lounge area',
    'Modern kitchen'],
  description = $$Wake up to endless ocean views in this top-floor penthouse on Ocean Drive. Resort amenities, private terrace and sunrise balconies define coastal luxury living.$$,
  amenities = array['Ocean View Terrace', 'Resort Pool', 'Concierge Service', 'Private Gym', 'Smart Home System'],
  lat = 25.7907, lng = -80.128
  where id = 'sea-view-penthouse';

update public.properties set
  slug = 'central-studio-chicago', garage = 0,
  images = array[image,
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt, 'Open plan studio space'],
  description = $$A smart, efficient studio in the heart of Chicago. Clever built-ins, abundant light and unbeatable access to the Loop make it perfect for city living.$$,
  amenities = array['Doorman Building', 'Fitness Center', 'Rooftop Deck'],
  lat = 41.8781, lng = -87.6298
  where id = 'central-studio';

update public.properties set
  slug = 'garden-villa-austin', garage = 1,
  images = array[image,
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Open kitchen and living area',
    'Calm bedroom retreat'],
  description = $$Minimalist villa wrapped in native landscaping. Polished concrete, shaded patios and a private garden offer quiet luxury minutes from South Congress.$$,
  amenities = array['Private Garden', 'Covered Patio', 'Smart Home System', 'Pet Friendly'],
  lat = 30.2672, lng = -97.7431
  where id = 'garden-villa';

update public.properties set
  slug = 'sunset-ridge-villa-los-angeles', garage = 2,
  images = array[image,
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Great room with disappearing glass walls',
    'Formal lounge',
    'Primary suite'],
  description = $$Above the Sunset Strip, this architectural villa captures canyon-to-city views. Infinity pool, screening room and walls of glass deliver the definitive LA lifestyle.$$,
  amenities = array['Infinity Pool', 'Screening Room', 'Smart Home System', 'Wine Cellar', 'Electric Vehicle Charging'],
  lat = 34.0522, lng = -118.2437
  where id = 'sunset-ridge-villa';

update public.properties set
  slug = 'palm-court-estate-palm-springs', garage = 3,
  images = array[image,
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Resort-style living pavilion',
    'Entertainer lounge',
    'Gourmet kitchen'],
  description = $$Mid-century soul meets modern comfort behind private gates. Saltwater pool, citrus grove and detached casita on nearly half an acre in the heart of Palm Springs.$$,
  amenities = array['Saltwater Pool', 'Guest Casita', 'Citrus Grove', 'Outdoor Kitchen', 'Smart Home System'],
  lat = 33.8303, lng = -116.5453
  where id = 'palm-court-estate';

update public.properties set
  slug = 'meridian-sky-loft-new-york', garage = 1,
  images = array[image,
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Open plan living and dining',
    'Home office corner'],
  description = $$Soaring ceilings and oversized arched windows define this Lexington Avenue loft. Full-service building with gym, lounge and roof deck in prime Murray Hill.$$,
  amenities = array['Doorman Building', 'Fitness Center', 'Roof Deck', 'In-unit Laundry'],
  lat = 40.758, lng = -73.9855
  where id = 'meridian-sky-loft';

update public.properties set
  slug = 'lakeview-modern-house-denver', garage = 2,
  images = array[image,
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Front elevation at golden hour',
    'Family room with fireplace',
    'Primary bedroom'],
  description = $$Crisp modern lines meet mountain views in this Denver standout. Chef kitchen, main-floor office and a sunny backyard deck complete the package.$$,
  amenities = array['Mountain Views', 'Home Office', 'Fireplace', 'Backyard Deck', 'Central Heating & Cooling'],
  lat = 39.7392, lng = -104.9903
  where id = 'lakeview-modern-house';

update public.properties set
  slug = 'coral-bay-residence-san-diego', garage = 2,
  images = array[image,
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Kitchen with quartz waterfall island',
    'Sunny breakfast nook'],
  description = $$Coastal contemporary living near the bay. Vaulted ceilings, owned solar and a drought-smart garden deliver style with everyday ease.$$,
  amenities = array['Owned Solar', 'Drought-smart Garden', 'Home Office', 'Central Heating & Cooling'],
  lat = 32.7157, lng = -117.1611
  where id = 'coral-bay-residence';

update public.properties set
  slug = 'downtown-design-apartment-san-francisco', garage = 1,
  images = array[image,
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Second bedroom with bay windows',
    'Renovated kitchen'],
  description = $$Designer finishes and classic San Francisco bones on Market Street. Bay windows, in-unit laundry and transit at your door.$$,
  amenities = array['Bay Windows', 'In-unit Laundry', 'Fitness Center', 'Pet Friendly'],
  lat = 37.7749, lng = -122.4194
  where id = 'downtown-design-apartment';

update public.properties set
  slug = 'white-oak-villa-dallas', garage = 2,
  images = array[image,
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Double-height great room',
    'Kitchen with butler pantry',
    'Guest suite'],
  description = $$Stately white villa on a heritage oak lot. Double-height great room, butler pantry and a loggia with fireplace anchor gracious Texas entertaining.$$,
  amenities = array['Heritage Oaks', 'Loggia with Fireplace', 'Butler Pantry', 'Smart Home System', 'Central Heating & Cooling'],
  lat = 32.7767, lng = -96.797
  where id = 'white-oak-villa';

update public.properties set
  slug = 'harbor-light-penthouse-boston', garage = 2,
  images = array[image,
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Harborside dining room',
    'Library lounge'],
  description = $$Floor-to-ceiling harbor views from every principal room. Private elevator entry, two terraces and white-glove services in the premier waterfront tower of Boston.$$,
  amenities = array['Harbor Views', 'Private Elevator Entry', 'Two Terraces', 'Concierge Service', 'Valet Parking'],
  lat = 42.3601, lng = -71.0589
  where id = 'harbor-light-penthouse';

update public.properties set
  slug = 'cedar-grove-house-nashville', garage = 2,
  images = array[image,
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Open kitchen with island seating',
    'Vaulted family room'],
  description = $$New-traditional charmer under mature cedars. Vaulted family room, mudroom and a fenced backyard minutes from the greenways of Nashville.$$,
  amenities = array['Fenced Backyard', 'Mudroom', 'Fireplace', 'Covered Porch', 'Central Heating & Cooling'],
  lat = 36.1627, lng = -86.7816
  where id = 'cedar-grove-house';

update public.properties set
  slug = 'marina-sky-penthouse-miami', garage = 2,
  images = array[image,
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'],
  images_alt = array[image_alt,
    'Bayfront great room',
    'Italian kitchen',
    'Primary suite with spa bath'],
  description = $$Sky-high over Biscayne Bay, this half-floor penthouse offers 10-foot glass, summer kitchen terrace and private marina slip. The finest full-service living in Miami.$$,
  amenities = array['Bayfront Terrace', 'Summer Kitchen', 'Private Marina Slip', 'Spa & Fitness Center', 'Smart Home System', 'Concierge Service'],
  lat = 25.775, lng = -80.185
  where id = 'marina-sky-penthouse';
