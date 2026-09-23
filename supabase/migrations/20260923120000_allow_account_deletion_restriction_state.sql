-- Keep permanent account deletion compatible with the profile governance
-- constraint that requires locked profiles to carry a restriction type.

create or replace function public.begin_permanent_account_deletion()
returns void
language plpgsql
security definer
set search_path = ''
as $function$
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

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'restriction_type'
  ) then
    execute 'update public.profiles
             set is_locked = true,
                 restriction_type = $1,
                 lock_reason = $2
             where user_id = $3'
      using 'soft', 'Permanent account deletion in progress', current_user_id;
  else
    update public.profiles
    set is_locked = true,
        lock_reason = 'Permanent account deletion in progress'
    where user_id = current_user_id;
  end if;
end;
$function$;

create or replace function public.cancel_permanent_account_deletion()
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  perform pg_catalog.set_config('khvi.account_deletion', 'on', true);

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'restriction_type'
  ) then
    execute 'update public.profiles
             set is_locked = false,
                 restriction_type = $1,
                 lock_reason = null
             where user_id = $2
               and deleted_at is null
               and lock_reason = $3'
      using 'none', current_user_id, 'Permanent account deletion in progress';
  else
    update public.profiles
    set is_locked = false,
        lock_reason = null
    where user_id = current_user_id
      and deleted_at is null
      and lock_reason = 'Permanent account deletion in progress';
  end if;
end;
$function$;

revoke all on function public.begin_permanent_account_deletion() from public;
revoke all on function public.begin_permanent_account_deletion() from anon;
grant execute on function public.begin_permanent_account_deletion() to authenticated;

revoke all on function public.cancel_permanent_account_deletion() from public;
revoke all on function public.cancel_permanent_account_deletion() from anon;
grant execute on function public.cancel_permanent_account_deletion() to authenticated;
