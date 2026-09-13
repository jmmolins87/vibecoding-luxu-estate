-- Migración 015: desactivación lógica de propiedades (soft-delete).
-- En lugar de borrar filas, se marca `is_active = false`: la propiedad
-- desaparece de la web pública pero sigue visible en el panel admin.
-- Idempotente: se puede ejecutar varias veces sin error.

alter table public.properties
  add column if not exists is_active boolean not null default true;

create index if not exists properties_is_active_idx
  on public.properties (is_active) where is_active = true;
