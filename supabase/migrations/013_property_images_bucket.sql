-- Migración 013: bucket `property-images` para la galería de propiedades.
-- Idempotente: se puede ejecutar varias veces sin error.
-- La subida se hace desde Server Actions con SERVICE ROLE (omite RLS);
-- la lectura es pública para que la web pueda mostrar las fotos.

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- Lectura pública solo de este bucket
drop policy if exists "property_images_public_read" on storage.objects;
create policy "property_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'property-images');

-- Escritura para usuarios autenticados (el guard de admin vive en la
-- Server Action; el service client omite RLS de todos modos)
drop policy if exists "property_images_auth_insert" on storage.objects;
create policy "property_images_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-images');

drop policy if exists "property_images_auth_update" on storage.objects;
create policy "property_images_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'property-images');

drop policy if exists "property_images_auth_delete" on storage.objects;
create policy "property_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-images');
