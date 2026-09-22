-- Migration: Admin Profiles Policies
-- Description: Allow users with role 'Admin' to view and manage all profiles.

-- 1. Grant update permissions on administrative columns to authenticated users (governed by RLS)
grant update (role, is_locked, lock_reason)
  on table public.profiles to authenticated;

-- 2. Helper function to check if the current user is an Admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'Admin'
      and is_locked = false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 3. Policy: Admin can view all profiles
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

-- 4. Policy: Admin can update role and status of any profile
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

