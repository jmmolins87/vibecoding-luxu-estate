-- Migración 006: roles de usuario para el dashboard administrativo
-- Ejecútala en el SQL Editor de Supabase (la anon key no tiene permisos DDL)
-- o aplícala con `supabase db push` si tienes el CLI vinculado.
-- Es idempotente: se puede ejecutar varias veces sin error.
--
-- Modelo:
--   - Tabla `public.user_roles` con PK = auth.users.id (1 fila por usuario).
--   - Roles admitidos: 'admin' | 'user' (por defecto 'user').
--   - Trigger que asigna 'user' automáticamente a cada nuevo registro en auth.users.

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user'
    check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_roles_role_idx on public.user_roles (role);

-- Mantiene `updated_at` al día en cada UPDATE.
create or replace function public.handle_user_role_updated()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_roles_set_updated_at on public.user_roles;
create trigger user_roles_set_updated_at
  before update on public.user_roles
  for each row execute function public.handle_user_role_updated();

-- Asigna el rol 'user' automáticamente al registrarse un usuario nuevo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: los usuarios ya registrados que no tengan fila reciben 'user'.
insert into public.user_roles (user_id, role)
select id, 'user' from auth.users
on conflict (user_id) do nothing;

-- Seguridad a nivel de fila (RLS)
alter table public.user_roles enable row level security;

-- Cada usuario autenticado puede leer SU propio rol
-- (necesario para que el proxy y la UI comprueben si es admin).
drop policy if exists "user_roles_own_select" on public.user_roles;
create policy "user_roles_own_select"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

-- Solo los admins pueden crear/actualizar/borrar roles.
drop policy if exists "user_roles_admin_all" on public.user_roles;
create policy "user_roles_admin_all"
  on public.user_roles for all
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

-- Para promover tu cuenta a admin tras aplicar la migración,
-- ejecuta en el SQL Editor (sustituye el email):
--   update public.user_roles ur
--   set role = 'admin'
--   from auth.users u
--   where ur.user_id = u.id and u.email = 'tu-email@example.com';
