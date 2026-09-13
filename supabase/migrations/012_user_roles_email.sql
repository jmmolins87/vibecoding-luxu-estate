-- Migración 012: columna `email` en `user_roles`.
--
-- Replica el email de auth.users para tenerlo visible en la tabla
-- (útil en el Table Editor y para consultas directas).
-- Se rellena al crear el usuario (trigger) y se sincroniza si el email
-- cambia en auth.users. Los passwords NUNCA se copian: viven solo en
-- auth.users con hash gestionado por Supabase Auth.
-- Es idempotente: se puede ejecutar varias veces sin error.

alter table public.user_roles
  add column if not exists email text;

-- Backfill para filas existentes.
update public.user_roles ur
  set email = u.email
  from auth.users u
  where ur.user_id = u.id
    and (ur.email is null or ur.email <> u.email);

-- El trigger de alta ahora guarda también el email.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role, email)
  values (new.id, 'user', new.email)
  on conflict (user_id) do update set email = excluded.email;
  return new;
end;
$$;

-- Sincroniza el email si cambia en auth.users.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email <> old.email then
    update public.user_roles
      set email = new.email
      where user_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();
