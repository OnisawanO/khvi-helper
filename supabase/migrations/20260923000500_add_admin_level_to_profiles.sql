-- Distinguish the primary Admin from delegated Admin accounts.
-- Existing Admin accounts are preserved as delegated until explicitly promoted.

alter table public.profiles
  add column if not exists admin_level text;

update public.profiles
set admin_level = 'delegated'
where role = 'Admin'
  and admin_level is null;

update public.profiles
set admin_level = null
where role <> 'Admin'
  and admin_level is not null;

alter table public.profiles
  drop constraint if exists profiles_admin_level_check;

alter table public.profiles
  add constraint profiles_admin_level_check
  check (admin_level is null or admin_level in ('primary', 'delegated'));

alter table public.profiles
  drop constraint if exists profiles_admin_level_role_check;

alter table public.profiles
  add constraint profiles_admin_level_role_check
  check (
    (role = 'Admin' and admin_level is not null)
    or (role <> 'Admin' and admin_level is null)
  );

create unique index if not exists profiles_single_primary_admin_idx
  on public.profiles (admin_level)
  where role = 'Admin' and admin_level = 'primary';
