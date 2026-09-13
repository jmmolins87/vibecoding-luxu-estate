-- Migración 005: placeholders únicos (picsum seed) por propiedad.
-- Generada desde data/properties.ts. Idempotente: se puede re-ejecutar.

update public.properties set
  images = array['https://picsum.photos/seed/glass-pavilion-1/1200/800', 'https://picsum.photos/seed/glass-pavilion-2/1200/800', 'https://picsum.photos/seed/glass-pavilion-3/1200/800', 'https://picsum.photos/seed/glass-pavilion-4/1200/800', 'https://picsum.photos/seed/glass-pavilion-5/1200/800']
  where id = 'glass-pavilion';

update public.properties set
  images = array['https://picsum.photos/seed/azure-heights-1/1200/800', 'https://picsum.photos/seed/azure-heights-2/1200/800', 'https://picsum.photos/seed/azure-heights-3/1200/800', 'https://picsum.photos/seed/azure-heights-4/1200/800', 'https://picsum.photos/seed/azure-heights-5/1200/800']
  where id = 'azure-heights';

update public.properties set
  images = array['https://picsum.photos/seed/modern-family-home-1/1200/800', 'https://picsum.photos/seed/modern-family-home-2/1200/800', 'https://picsum.photos/seed/modern-family-home-3/1200/800', 'https://picsum.photos/seed/modern-family-home-4/1200/800', 'https://picsum.photos/seed/modern-family-home-5/1200/800']
  where id = 'modern-family-home';

update public.properties set
  images = array['https://picsum.photos/seed/urban-loft-1/1200/800', 'https://picsum.photos/seed/urban-loft-2/1200/800', 'https://picsum.photos/seed/urban-loft-3/1200/800', 'https://picsum.photos/seed/urban-loft-4/1200/800', 'https://picsum.photos/seed/urban-loft-5/1200/800']
  where id = 'urban-loft';

update public.properties set
  images = array['https://picsum.photos/seed/highland-retreat-1/1200/800', 'https://picsum.photos/seed/highland-retreat-2/1200/800', 'https://picsum.photos/seed/highland-retreat-3/1200/800', 'https://picsum.photos/seed/highland-retreat-4/1200/800', 'https://picsum.photos/seed/highland-retreat-5/1200/800']
  where id = 'highland-retreat';

update public.properties set
  images = array['https://picsum.photos/seed/sea-view-penthouse-1/1200/800', 'https://picsum.photos/seed/sea-view-penthouse-2/1200/800', 'https://picsum.photos/seed/sea-view-penthouse-3/1200/800', 'https://picsum.photos/seed/sea-view-penthouse-4/1200/800', 'https://picsum.photos/seed/sea-view-penthouse-5/1200/800']
  where id = 'sea-view-penthouse';

update public.properties set
  images = array['https://picsum.photos/seed/central-studio-1/1200/800', 'https://picsum.photos/seed/central-studio-2/1200/800', 'https://picsum.photos/seed/central-studio-3/1200/800', 'https://picsum.photos/seed/central-studio-4/1200/800', 'https://picsum.photos/seed/central-studio-5/1200/800']
  where id = 'central-studio';

update public.properties set
  images = array['https://picsum.photos/seed/garden-villa-1/1200/800', 'https://picsum.photos/seed/garden-villa-2/1200/800', 'https://picsum.photos/seed/garden-villa-3/1200/800', 'https://picsum.photos/seed/garden-villa-4/1200/800', 'https://picsum.photos/seed/garden-villa-5/1200/800']
  where id = 'garden-villa';

update public.properties set
  images = array['https://picsum.photos/seed/sunset-ridge-villa-1/1200/800', 'https://picsum.photos/seed/sunset-ridge-villa-2/1200/800', 'https://picsum.photos/seed/sunset-ridge-villa-3/1200/800', 'https://picsum.photos/seed/sunset-ridge-villa-4/1200/800', 'https://picsum.photos/seed/sunset-ridge-villa-5/1200/800']
  where id = 'sunset-ridge-villa';

update public.properties set
  images = array['https://picsum.photos/seed/palm-court-estate-1/1200/800', 'https://picsum.photos/seed/palm-court-estate-2/1200/800', 'https://picsum.photos/seed/palm-court-estate-3/1200/800', 'https://picsum.photos/seed/palm-court-estate-4/1200/800', 'https://picsum.photos/seed/palm-court-estate-5/1200/800']
  where id = 'palm-court-estate';

update public.properties set
  images = array['https://picsum.photos/seed/meridian-sky-loft-1/1200/800', 'https://picsum.photos/seed/meridian-sky-loft-2/1200/800', 'https://picsum.photos/seed/meridian-sky-loft-3/1200/800', 'https://picsum.photos/seed/meridian-sky-loft-4/1200/800', 'https://picsum.photos/seed/meridian-sky-loft-5/1200/800']
  where id = 'meridian-sky-loft';

update public.properties set
  images = array['https://picsum.photos/seed/lakeview-modern-house-1/1200/800', 'https://picsum.photos/seed/lakeview-modern-house-2/1200/800', 'https://picsum.photos/seed/lakeview-modern-house-3/1200/800', 'https://picsum.photos/seed/lakeview-modern-house-4/1200/800', 'https://picsum.photos/seed/lakeview-modern-house-5/1200/800']
  where id = 'lakeview-modern-house';

update public.properties set
  images = array['https://picsum.photos/seed/coral-bay-residence-1/1200/800', 'https://picsum.photos/seed/coral-bay-residence-2/1200/800', 'https://picsum.photos/seed/coral-bay-residence-3/1200/800', 'https://picsum.photos/seed/coral-bay-residence-4/1200/800', 'https://picsum.photos/seed/coral-bay-residence-5/1200/800']
  where id = 'coral-bay-residence';

update public.properties set
  images = array['https://picsum.photos/seed/downtown-design-apartment-1/1200/800', 'https://picsum.photos/seed/downtown-design-apartment-2/1200/800', 'https://picsum.photos/seed/downtown-design-apartment-3/1200/800', 'https://picsum.photos/seed/downtown-design-apartment-4/1200/800', 'https://picsum.photos/seed/downtown-design-apartment-5/1200/800']
  where id = 'downtown-design-apartment';

update public.properties set
  images = array['https://picsum.photos/seed/white-oak-villa-1/1200/800', 'https://picsum.photos/seed/white-oak-villa-2/1200/800', 'https://picsum.photos/seed/white-oak-villa-3/1200/800', 'https://picsum.photos/seed/white-oak-villa-4/1200/800', 'https://picsum.photos/seed/white-oak-villa-5/1200/800']
  where id = 'white-oak-villa';

update public.properties set
  images = array['https://picsum.photos/seed/harbor-light-penthouse-1/1200/800', 'https://picsum.photos/seed/harbor-light-penthouse-2/1200/800', 'https://picsum.photos/seed/harbor-light-penthouse-3/1200/800', 'https://picsum.photos/seed/harbor-light-penthouse-4/1200/800', 'https://picsum.photos/seed/harbor-light-penthouse-5/1200/800']
  where id = 'harbor-light-penthouse';

update public.properties set
  images = array['https://picsum.photos/seed/cedar-grove-house-1/1200/800', 'https://picsum.photos/seed/cedar-grove-house-2/1200/800', 'https://picsum.photos/seed/cedar-grove-house-3/1200/800', 'https://picsum.photos/seed/cedar-grove-house-4/1200/800', 'https://picsum.photos/seed/cedar-grove-house-5/1200/800']
  where id = 'cedar-grove-house';

update public.properties set
  images = array['https://picsum.photos/seed/marina-sky-penthouse-1/1200/800', 'https://picsum.photos/seed/marina-sky-penthouse-2/1200/800', 'https://picsum.photos/seed/marina-sky-penthouse-3/1200/800', 'https://picsum.photos/seed/marina-sky-penthouse-4/1200/800', 'https://picsum.photos/seed/marina-sky-penthouse-5/1200/800']
  where id = 'marina-sky-penthouse';

update public.properties set
  images = array['https://picsum.photos/seed/brooklyn-brownstone-1/1200/800', 'https://picsum.photos/seed/brooklyn-brownstone-2/1200/800', 'https://picsum.photos/seed/brooklyn-brownstone-3/1200/800', 'https://picsum.photos/seed/brooklyn-brownstone-4/1200/800', 'https://picsum.photos/seed/brooklyn-brownstone-5/1200/800']
  where id = 'brooklyn-brownstone';

update public.properties set
  images = array['https://picsum.photos/seed/malibu-beach-house-1/1200/800', 'https://picsum.photos/seed/malibu-beach-house-2/1200/800', 'https://picsum.photos/seed/malibu-beach-house-3/1200/800', 'https://picsum.photos/seed/malibu-beach-house-4/1200/800', 'https://picsum.photos/seed/malibu-beach-house-5/1200/800']
  where id = 'malibu-beach-house';

update public.properties set
  images = array['https://picsum.photos/seed/aspen-chalet-1/1200/800', 'https://picsum.photos/seed/aspen-chalet-2/1200/800', 'https://picsum.photos/seed/aspen-chalet-3/1200/800', 'https://picsum.photos/seed/aspen-chalet-4/1200/800', 'https://picsum.photos/seed/aspen-chalet-5/1200/800']
  where id = 'aspen-chalet';

update public.properties set
  images = array['https://picsum.photos/seed/miami-beach-loft-1/1200/800', 'https://picsum.photos/seed/miami-beach-loft-2/1200/800', 'https://picsum.photos/seed/miami-beach-loft-3/1200/800', 'https://picsum.photos/seed/miami-beach-loft-4/1200/800', 'https://picsum.photos/seed/miami-beach-loft-5/1200/800']
  where id = 'miami-beach-loft';

update public.properties set
  images = array['https://picsum.photos/seed/greenwich-colonial-1/1200/800', 'https://picsum.photos/seed/greenwich-colonial-2/1200/800', 'https://picsum.photos/seed/greenwich-colonial-3/1200/800', 'https://picsum.photos/seed/greenwich-colonial-4/1200/800', 'https://picsum.photos/seed/greenwich-colonial-5/1200/800']
  where id = 'greenwich-colonial';

update public.properties set
  images = array['https://picsum.photos/seed/newport-villa-1/1200/800', 'https://picsum.photos/seed/newport-villa-2/1200/800', 'https://picsum.photos/seed/newport-villa-3/1200/800', 'https://picsum.photos/seed/newport-villa-4/1200/800', 'https://picsum.photos/seed/newport-villa-5/1200/800']
  where id = 'newport-villa';

update public.properties set
  images = array['https://picsum.photos/seed/beacon-townhouse-1/1200/800', 'https://picsum.photos/seed/beacon-townhouse-2/1200/800', 'https://picsum.photos/seed/beacon-townhouse-3/1200/800', 'https://picsum.photos/seed/beacon-townhouse-4/1200/800', 'https://picsum.photos/seed/beacon-townhouse-5/1200/800']
  where id = 'beacon-townhouse';

update public.properties set
  images = array['https://picsum.photos/seed/tahoe-cabin-1/1200/800', 'https://picsum.photos/seed/tahoe-cabin-2/1200/800', 'https://picsum.photos/seed/tahoe-cabin-3/1200/800', 'https://picsum.photos/seed/tahoe-cabin-4/1200/800', 'https://picsum.photos/seed/tahoe-cabin-5/1200/800']
  where id = 'tahoe-cabin';

update public.properties set
  images = array['https://picsum.photos/seed/charleston-single-1/1200/800', 'https://picsum.photos/seed/charleston-single-2/1200/800', 'https://picsum.photos/seed/charleston-single-3/1200/800', 'https://picsum.photos/seed/charleston-single-4/1200/800', 'https://picsum.photos/seed/charleston-single-5/1200/800']
  where id = 'charleston-single';

update public.properties set
  images = array['https://picsum.photos/seed/santa-fe-adobe-1/1200/800', 'https://picsum.photos/seed/santa-fe-adobe-2/1200/800', 'https://picsum.photos/seed/santa-fe-adobe-3/1200/800', 'https://picsum.photos/seed/santa-fe-adobe-4/1200/800', 'https://picsum.photos/seed/santa-fe-adobe-5/1200/800']
  where id = 'santa-fe-adobe';

update public.properties set
  images = array['https://picsum.photos/seed/napa-estate-1/1200/800', 'https://picsum.photos/seed/napa-estate-2/1200/800', 'https://picsum.photos/seed/napa-estate-3/1200/800', 'https://picsum.photos/seed/napa-estate-4/1200/800', 'https://picsum.photos/seed/napa-estate-5/1200/800']
  where id = 'napa-estate';

update public.properties set
  images = array['https://picsum.photos/seed/jackson-hole-lodge-1/1200/800', 'https://picsum.photos/seed/jackson-hole-lodge-2/1200/800', 'https://picsum.photos/seed/jackson-hole-lodge-3/1200/800', 'https://picsum.photos/seed/jackson-hole-lodge-4/1200/800', 'https://picsum.photos/seed/jackson-hole-lodge-5/1200/800']
  where id = 'jackson-hole-lodge';

update public.properties set
  images = array['https://picsum.photos/seed/savannah-row-1/1200/800', 'https://picsum.photos/seed/savannah-row-2/1200/800', 'https://picsum.photos/seed/savannah-row-3/1200/800', 'https://picsum.photos/seed/savannah-row-4/1200/800', 'https://picsum.photos/seed/savannah-row-5/1200/800']
  where id = 'savannah-row';

update public.properties set
  images = array['https://picsum.photos/seed/portland-loft-1/1200/800', 'https://picsum.photos/seed/portland-loft-2/1200/800', 'https://picsum.photos/seed/portland-loft-3/1200/800', 'https://picsum.photos/seed/portland-loft-4/1200/800', 'https://picsum.photos/seed/portland-loft-5/1200/800']
  where id = 'portland-loft';

update public.properties set
  images = array['https://picsum.photos/seed/austin-penthouse-1/1200/800', 'https://picsum.photos/seed/austin-penthouse-2/1200/800', 'https://picsum.photos/seed/austin-penthouse-3/1200/800', 'https://picsum.photos/seed/austin-penthouse-4/1200/800', 'https://picsum.photos/seed/austin-penthouse-5/1200/800']
  where id = 'austin-penthouse';

update public.properties set
  images = array['https://picsum.photos/seed/denver-loft-1/1200/800', 'https://picsum.photos/seed/denver-loft-2/1200/800', 'https://picsum.photos/seed/denver-loft-3/1200/800', 'https://picsum.photos/seed/denver-loft-4/1200/800', 'https://picsum.photos/seed/denver-loft-5/1200/800']
  where id = 'denver-loft';

update public.properties set
  images = array['https://picsum.photos/seed/scottsdale-villa-1/1200/800', 'https://picsum.photos/seed/scottsdale-villa-2/1200/800', 'https://picsum.photos/seed/scottsdale-villa-3/1200/800', 'https://picsum.photos/seed/scottsdale-villa-4/1200/800', 'https://picsum.photos/seed/scottsdale-villa-5/1200/800']
  where id = 'scottsdale-villa';

update public.properties set
  images = array['https://picsum.photos/seed/naples-villa-1/1200/800', 'https://picsum.photos/seed/naples-villa-2/1200/800', 'https://picsum.photos/seed/naples-villa-3/1200/800', 'https://picsum.photos/seed/naples-villa-4/1200/800', 'https://picsum.photos/seed/naples-villa-5/1200/800']
  where id = 'naples-villa';

update public.properties set
  images = array['https://picsum.photos/seed/park-city-chalet-1/1200/800', 'https://picsum.photos/seed/park-city-chalet-2/1200/800', 'https://picsum.photos/seed/park-city-chalet-3/1200/800', 'https://picsum.photos/seed/park-city-chalet-4/1200/800', 'https://picsum.photos/seed/park-city-chalet-5/1200/800']
  where id = 'park-city-chalet';

update public.properties set
  images = array['https://picsum.photos/seed/lajolla-penthouse-1/1200/800', 'https://picsum.photos/seed/lajolla-penthouse-2/1200/800', 'https://picsum.photos/seed/lajolla-penthouse-3/1200/800', 'https://picsum.photos/seed/lajolla-penthouse-4/1200/800', 'https://picsum.photos/seed/lajolla-penthouse-5/1200/800']
  where id = 'lajolla-penthouse';
