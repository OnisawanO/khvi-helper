-- Allow the self-service deletion RPC to lock its profile while keeping
-- privileged profile fields protected from direct account-owner updates.

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() = old.user_id
     and (
       new.role is distinct from old.role
       or new.is_locked is distinct from old.is_locked
       or new.lock_reason is distinct from old.lock_reason
     )
     and not (
       current_user = 'postgres'
       and coalesce(pg_catalog.current_setting('khvi.account_deletion', true), '') = 'on'
     ) then
    raise exception 'Privileged profile fields cannot be changed by the account owner';
  end if;

  return new;
end;
$$;

create or replace function public.begin_permanent_account_deletion()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  perform pg_catalog.set_config('khvi.account_deletion', 'on', true);

  perform 1
  from public.profiles p
  where p.user_id = current_user_id
    and p.deleted_at is null
  for update;

  if not found then
    raise exception 'profile_not_found';
  end if;

  update public.bookings
  set status = 'expired',
      cancelled_by = 'system',
      cancel_reason = 'Request expired before permanent account deletion.'
  where user_id = current_user_id
    and status = 'open'
    and expires_at <= timezone('utc', now());

  if exists (
    select 1
    from public.bookings b
    where (b.user_id = current_user_id or b.interpreter_id = current_user_id)
      and (
        (b.status = 'open' and b.expires_at > timezone('utc', now()))
        or b.status in ('claimed', 'in_progress')
      )
  ) then
    raise exception 'active_bookings_exist';
  end if;

  update public.profiles
  set is_locked = true,
      lock_reason = 'Permanent account deletion in progress'
  where user_id = current_user_id;
end;
$$;

create or replace function public.cancel_permanent_account_deletion()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  perform pg_catalog.set_config('khvi.account_deletion', 'on', true);

  update public.profiles
  set is_locked = false,
      lock_reason = null
  where user_id = current_user_id
    and deleted_at is null
    and lock_reason = 'Permanent account deletion in progress';
end;
$$;

revoke all on function public.begin_permanent_account_deletion() from public;
revoke all on function public.begin_permanent_account_deletion() from anon;
grant execute on function public.begin_permanent_account_deletion() to authenticated;

revoke all on function public.cancel_permanent_account_deletion() from public;
revoke all on function public.cancel_permanent_account_deletion() from anon;
grant execute on function public.cancel_permanent_account_deletion() to authenticated;
