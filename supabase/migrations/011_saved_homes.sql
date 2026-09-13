-- Migración 011: favoritos (`saved_homes`) sincronizados con la cuenta.
--
-- Cada fila une un usuario de auth.users con una propiedad.
-- PK compuesta (user_id, property_id): sin duplicados.
-- Al borrar un usuario o una propiedad, sus favoritos desaparecen (cascade).
-- RLS: cada usuario autenticado solo gestiona SUS propias filas.
-- Es idempotente: se puede ejecutar varias veces sin error.

create table if not exists public.saved_homes (
  user_id uuid not null references auth.users (id) on delete cascade,
  property_id text not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create index if not exists saved_homes_user_idx
  on public.saved_homes (user_id, created_at desc);

alter table public.saved_homes enable row level security;

drop policy if exists "saved_homes_own_select" on public.saved_homes;
create policy "saved_homes_own_select"
  on public.saved_homes for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "saved_homes_own_insert" on public.saved_homes;
create policy "saved_homes_own_insert"
  on public.saved_homes for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "saved_homes_own_delete" on public.saved_homes;
create policy "saved_homes_own_delete"
  on public.saved_homes for delete
  to authenticated
  using (user_id = auth.uid());
