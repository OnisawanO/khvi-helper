-- Allow one explicitly designated test interpreter to inspect every matching
-- open request without weakening access for normal interpreters.
-- The flag is intentionally not writable by authenticated users; profiles only
-- grants updates to the normal profile fields.

alter table public.profiles
  add column if not exists is_super_interpreter boolean not null default false;

drop policy if exists bookings_select_visible_to_actor on public.bookings;
create policy bookings_select_visible_to_actor
  on public.bookings
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or interpreter_id = (select auth.uid())
    or exists (
      select 1
      from public.profiles p
      where p.user_id = (select auth.uid())
        and p.role in ('Manager', 'Admin')
    )
    or (
      status = 'open'
      and expires_at > timezone('utc', now())
      and exists (
        select 1
        from public.profiles actor
        where actor.user_id = (select auth.uid())
          and actor.role = 'Interpreter'
          and actor.is_locked = false
      )
      and (
        (
          exists (
            select 1
            from public.profiles actor
            where actor.user_id = (select auth.uid())
              and actor.is_super_interpreter = true
          )
          and exists (
            select 1
            from public.interpreter_applications a
            where a.user_id = (select auth.uid())
              and a.status = 'approved'
          )
        )
        or exists (
          select 1
          from public.interpreter_applications a
          join public.interpreter_application_languages al
            on al.application_id = a.application_id
          join public.interpreter_application_categories ac
            on ac.application_id = a.application_id
          where a.user_id = (select auth.uid())
            and a.status = 'approved'
            and al.language_id = bookings.language_id
            and ac.category_id = bookings.category_id
        )
      )
    )
  );

create or replace function public.claim_booking(p_booking_id bigint)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := (select auth.uid());
  target public.bookings;
begin
  if current_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select * into target
  from public.bookings
  where booking_id = p_booking_id
  for update;

  if not found then
    raise exception 'booking_not_found';
  end if;

  if target.status <> 'open' or target.expires_at <= timezone('utc', now()) then
    if target.status = 'open' and target.expires_at <= timezone('utc', now()) then
      update public.bookings
      set status = 'expired', cancelled_by = 'system', cancel_reason = 'No interpreter claimed the request before its deadline.'
      where booking_id = p_booking_id;
    end if;
    raise exception 'booking_not_available';
  end if;

  if target.user_id = current_user_id then
    raise exception 'cannot_claim_own_booking';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.user_id = current_user_id and p.role = 'Interpreter' and p.is_locked = false
  ) then
    raise exception 'interpreter_role_required';
  end if;

  if not exists (
    select 1
    from public.interpreter_applications a
    where a.user_id = current_user_id
      and a.status = 'approved'
  ) then
    raise exception 'interpreter_skill_mismatch';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.user_id = current_user_id
      and p.is_super_interpreter = true
  )
  and not exists (
    select 1
    from public.interpreter_applications a
    join public.interpreter_application_languages al on al.application_id = a.application_id
    join public.interpreter_application_categories ac on ac.application_id = a.application_id
    where a.user_id = current_user_id
      and a.status = 'approved'
      and al.language_id = target.language_id
      and ac.category_id = target.category_id
  ) then
    raise exception 'interpreter_skill_mismatch';
  end if;

  if exists (
    select 1 from public.bookings b
    where b.interpreter_id = current_user_id
      and b.status in ('claimed', 'in_progress')
  ) then
    raise exception 'active_assignment_exists';
  end if;

  update public.bookings
  set interpreter_id = current_user_id,
      status = 'claimed',
      claimed_at = coalesce(claimed_at, timezone('utc', now())),
      requester_confirmed_at = null
  where booking_id = p_booking_id;

  return p_booking_id;
end;
$$;

revoke all on function public.claim_booking(bigint) from public;
grant execute on function public.claim_booking(bigint) to authenticated;
