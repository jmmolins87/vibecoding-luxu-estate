-- Migración 009: auto-creación del rol por defecto a nivel de RLS.
--
-- Contexto: el trigger `on_auth_user_created` (migración 006) crea la fila con
-- rol 'user' al registrarse. Como red de seguridad, esta política permite que
-- un usuario autenticado cree SU PROPIA fila si no existe (p. ej. usuarios
-- anteriores al trigger o inserciones manuales en auth.users), pero SOLO con
-- el rol por defecto 'user'. Nadie puede auto-otorgarse 'admin'.
-- Es idempotente: se puede ejecutar varias veces sin error.

drop policy if exists "user_roles_own_insert" on public.user_roles;
create policy "user_roles_own_insert"
  on public.user_roles for insert
  to authenticated
  with check (user_id = auth.uid() and role = 'user');
