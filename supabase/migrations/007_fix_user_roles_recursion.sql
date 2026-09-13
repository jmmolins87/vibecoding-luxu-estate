-- Migración 007: corrige recursión infinita en las políticas de `user_roles`.
--
-- Problema: la política `user_roles_admin_all` (FOR ALL) consultaba la propia
-- tabla `user_roles` en su cláusula USING. Al evaluar CUALQUIER consulta sobre
-- la tabla (incluso la lectura del rol propio), Postgres re-entraba en la
-- evaluación de políticas -> "infinite recursion detected in policy"
-- (PostgREST devuelve HTTP 500 y `getCurrentUserRole()` devolvía null).
--
-- Solución: comprobar el rol admin mediante una función SECURITY DEFINER
-- (omite RLS y rompe la recursión) y usarla en la política.
-- Es idempotente: se puede ejecutar varias veces sin error.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- Solo revela si EL PROPIO solicitante es admin: sin fuga de datos.
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "user_roles_admin_all" on public.user_roles;
create policy "user_roles_admin_all"
  on public.user_roles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
