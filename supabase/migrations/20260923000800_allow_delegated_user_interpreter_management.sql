-- Allow delegated Admins to manage User and Interpreter accounts only.
-- Manager/Admin governance stays reserved for the Primary Admin.

grant update (role, admin_level, is_locked, lock_reason)
  on table public.profiles to authenticated;

create or replace function public.profile_security_fields_unchanged(
  p_user_id uuid,
  p_role text,
  p_admin_level text,
  p_is_locked boolean,
  p_lock_reason text
)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = p_user_id
      and p.role is not distinct from p_role
      and p.admin_level is not distinct from p_admin_level
      and p.is_locked is not distinct from p_is_locked
      and p.lock_reason is not distinct from p_lock_reason
  );
$$;

revoke all on function public.profile_security_fields_unchanged(uuid, text, text, boolean, text) from public;
grant execute on function public.profile_security_fields_unchanged(uuid, text, text, boolean, text) to authenticated;

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and public.profile_security_fields_unchanged(user_id, role, admin_level, is_locked, lock_reason)
  );

create or replace function public.is_primary_admin()
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
      and admin_level = 'primary'
      and is_locked = false
  );
$$;

create or replace function public.is_delegated_admin()
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
      and admin_level = 'delegated'
      and is_locked = false
  );
$$;

revoke all on function public.is_primary_admin() from public;
revoke all on function public.is_delegated_admin() from public;
grant execute on function public.is_primary_admin() to authenticated;
grant execute on function public.is_delegated_admin() to authenticated;

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (
    public.is_primary_admin()
    or (
      public.is_delegated_admin()
      and role in ('User', 'Interpreter')
    )
  )
  with check (
    (
      public.is_primary_admin()
      and (
        role <> 'Interpreter'
        or exists (
          select 1
          from public.interpreter_applications ia
          where ia.user_id = profiles.user_id
            and ia.status = 'approved'
        )
      )
    )
    or (
      public.is_delegated_admin()
      and role in ('User', 'Interpreter')
      and admin_level is null
      and (
        role = 'User'
        or exists (
          select 1
          from public.interpreter_applications ia
          where ia.user_id = profiles.user_id
            and ia.status = 'approved'
        )
      )
    )
  );
