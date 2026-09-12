-- Migración 002: bandera `featured` para Featured Collections
-- Ejecútala en el SQL Editor de Supabase después de la 001.
-- Es idempotente: se puede ejecutar varias veces sin error.
-- Sirve para BBDD ya creadas antes de que existiera la columna `featured`.

alter table public.properties
  add column if not exists featured boolean not null default false;

create index if not exists properties_featured_idx
  on public.properties (featured) where featured = true;

-- Asegura que las 2 colecciones destacadas queden marcadas,
-- sin pisar el resto de filas que ya tengas en la tabla.
update public.properties
set featured = true
where id in ('glass-pavilion', 'azure-heights');
