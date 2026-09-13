-- Migración 010: `id` UUID como clave primaria de `user_roles`.
--
-- Hasta ahora la PK era `user_id`. Se añade `id uuid` autogenerado como
-- identificador único de cada fila y `user_id` pasa a ser UNIQUE
-- (se mantiene el modelo "1 fila por usuario" y el upsert por `user_id`
-- que usa el panel admin sigue funcionando).
-- Es idempotente: se puede ejecutar varias veces sin error.

create extension if not exists "pgcrypto";

alter table public.user_roles
  add column if not exists id uuid default gen_random_uuid();

-- Rellena filas preexistentes que quedaran con NULL.
update public.user_roles
  set id = gen_random_uuid()
  where id is null;

alter table public.user_roles
  alter column id set not null;

-- Mueve la PK de `user_id` a `id`.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.user_roles'::regclass
      and contype = 'p'
      and conname = 'user_roles_pkey'
  ) then
    alter table public.user_roles drop constraint user_roles_pkey;
  end if;

  if not exists (
    select 1 from pg_index i
    join pg_class t on t.oid = i.indrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'user_roles'
      and i.indisprimary
  ) then
    alter table public.user_roles add primary key (id);
  end if;
end $$;

-- `user_id` sigue siendo único: 1 fila por usuario.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.user_roles'::regclass
      and conname = 'user_roles_user_id_key'
  ) then
    alter table public.user_roles
      add constraint user_roles_user_id_key unique (user_id);
  end if;
end $$;
