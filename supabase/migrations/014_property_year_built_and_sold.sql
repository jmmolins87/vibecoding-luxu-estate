-- Migración 014: año de construcción + estado `sold`.
-- Idempotente: se puede ejecutar varias veces sin error.

alter table public.properties
  add column if not exists year_built integer;

alter table public.properties drop constraint if exists properties_status_check;
alter table public.properties
  add constraint properties_status_check
  check (status in ('sale', 'rent', 'sold'));
