-- Prepare permanent self-service account deletion without exposing Auth admin
-- privileges to the browser. The Next.js server action performs the final
-- auth.users deletion through the Supabase Admin API.

alter table public.reviews
  drop constraint if exists reviews_booking_id_fkey;
alter table public.reviews
  add constraint reviews_booking_id_fkey
  foreign key (booking_id)
  references public.bookings(booking_id)
  on delete cascade;

alter table public.reviews
  drop constraint if exists reviews_reviewer_id_fkey;
alter table public.reviews
  add constraint reviews_reviewer_id_fkey
  foreign key (reviewer_id)
  references public.profiles(user_id)
  on delete cascade;

alter table public.reviews
  drop constraint if exists reviews_reviewee_id_fkey;
alter table public.reviews
  add constraint reviews_reviewee_id_fkey
  foreign key (reviewee_id)
  references public.profiles(user_id)
  on delete cascade;

drop function if exists public.delete_my_account();

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
