-- Profiles are the application-facing extension of auth.users.
-- Supabase Auth remains the source of truth for identity, passwords, and sessions.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null default '',
  phone text,
  date_of_birth date,
  preferred_ui_language text not null default 'th'
    check (preferred_ui_language in ('th', 'en', 'zh', 'my', 'vi')),
  role text not null default 'User'
    check (role in ('User', 'Interpreter', 'Manager', 'Admin')),
  is_locked boolean not null default false,
  lock_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_role_idx on public.profiles(role);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (first_name, last_name, phone, date_of_birth, preferred_ui_language)
  on table public.profiles to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create schema if not exists private;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  full_name text := trim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  first_name_value text := nullif(
    trim(coalesce(nullif(new.raw_user_meta_data ->> 'first_name', ''), split_part(full_name, ' ', 1))),
    ''
  );
  last_name_value text := nullif(
    trim(coalesce(
      nullif(new.raw_user_meta_data ->> 'last_name', ''),
      btrim(substr(full_name, length(split_part(full_name, ' ', 1)) + 1))
    )),
    ''
  );
  date_of_birth_value date;
begin
  if coalesce(new.raw_user_meta_data ->> 'date_of_birth', '') ~ '^\d{4}-\d{2}-\d{2}$' then
    date_of_birth_value := (new.raw_user_meta_data ->> 'date_of_birth')::date;
  end if;

  insert into public.profiles (
    user_id,
    first_name,
    last_name,
    phone,
    date_of_birth,
    preferred_ui_language,
    role
  )
  values (
    new.id,
    coalesce(first_name_value, 'KHVI User'),
    coalesce(last_name_value, ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    date_of_birth_value,
    case
      when new.raw_user_meta_data ->> 'preferred_ui_language' in ('th', 'en', 'zh', 'my', 'vi')
        then new.raw_user_meta_data ->> 'preferred_ui_language'
      else 'th'
    end,
    'User'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;
revoke all on schema private from public;
grant usage on schema private to authenticated;
grant execute on function private.set_updated_at() to authenticated;
grant usage on schema private to supabase_auth_admin;
grant execute on function private.handle_new_user() to supabase_auth_admin;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_user();
