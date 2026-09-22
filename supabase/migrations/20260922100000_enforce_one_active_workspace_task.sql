-- Keep the one-active-task rule consistent across requester and interpreter modes.
-- The profile row lock serializes create/claim mutations for the same account.

-- All booking creation must go through the guarded RPC below.
revoke insert on public.bookings from authenticated;
revoke insert on public.booking_private_details from authenticated;

create or replace function public.create_booking(
  p_language_code text,
  p_category_code text,
  p_description text,
  p_location_name text,
  p_exact_address text,
  p_latitude numeric,
  p_longitude numeric,
  p_urgency text,
  p_scheduled_at timestamptz default null
)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := (select auth.uid());
  active_profile public.profiles%rowtype;
  selected_language_id bigint;
  selected_category_id bigint;
  new_booking_id bigint;
  calculated_expiry timestamptz;
begin
  if current_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select * into active_profile
  from public.profiles
  where user_id = current_user_id
  for update;

  if not found or active_profile.is_locked or active_profile.deleted_at is not null then
    raise exception 'account_not_active';
  end if;

  if exists (
    select 1
    from public.bookings b
    where (b.user_id = current_user_id or b.interpreter_id = current_user_id)
      and b.status in ('open', 'claimed', 'in_progress')
      and (b.status <> 'open' or b.expires_at > timezone('utc', now()))
  ) then
    raise exception 'active_workspace_task_exists';
  end if;

  if p_urgency not in ('immediate', 'scheduled') then
    raise exception 'invalid_urgency';
  end if;

  if p_urgency = 'scheduled' and p_scheduled_at is null then
    raise exception 'scheduled_at_required';
  end if;

  if p_urgency = 'scheduled'
     and (p_scheduled_at at time zone 'Asia/Bangkok')::date < timezone('Asia/Bangkok', now())::date + 1 then
    raise exception 'scheduled_at_must_be_next_day_or_later';
  end if;

  select language_id into selected_language_id
  from public.languages
  where language_code = p_language_code and is_active = true;

  select category_id into selected_category_id
  from public.categories
  where category_code = p_category_code and is_active = true;

  if selected_language_id is null or selected_category_id is null then
    raise exception 'unsupported_reference_value';
  end if;

  calculated_expiry := case
    when p_urgency = 'scheduled' then p_scheduled_at
    else timezone('utc', now()) + interval '30 minutes'
  end;

  insert into public.bookings (
    user_id, language_id, category_id, description, location_name,
    area_latitude, area_longitude,
    urgency, status, scheduled_at, expires_at
  )
  values (
    current_user_id,
    selected_language_id,
    selected_category_id,
    trim(coalesce(p_description, '')),
    'Approximate area',
    round(p_latitude, 2),
    round(p_longitude, 2),
    p_urgency,
    'open',
    p_scheduled_at,
    calculated_expiry
  )
  returning booking_id into new_booking_id;

  insert into public.booking_private_details (booking_id, exact_address, latitude, longitude)
  values (new_booking_id, trim(p_exact_address), p_latitude, p_longitude);

  return new_booking_id;
end;
$$;

create or replace function public.claim_booking(p_booking_id bigint)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := (select auth.uid());
  active_profile public.profiles%rowtype;
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

  select * into active_profile
  from public.profiles
  where user_id = current_user_id
  for update;

  if not found or active_profile.role <> 'Interpreter' or active_profile.is_locked or active_profile.deleted_at is not null then
    raise exception 'interpreter_role_required';
  end if;

  if exists (
    select 1
    from public.bookings b
    where (b.user_id = current_user_id or b.interpreter_id = current_user_id)
      and b.status in ('open', 'claimed', 'in_progress')
      and (b.status <> 'open' or b.expires_at > timezone('utc', now()))
  ) then
    raise exception 'active_workspace_task_exists';
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
    join public.interpreter_application_languages al
      on al.application_id = a.application_id
    join public.interpreter_application_categories ac
      on ac.application_id = a.application_id
    where a.user_id = current_user_id
      and a.status = 'approved'
      and al.language_id = target.language_id
      and ac.category_id = target.category_id
  ) then
    raise exception 'interpreter_skill_mismatch';
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

revoke all on function public.create_booking(text, text, text, text, text, numeric, numeric, text, timestamptz) from public;
revoke all on function public.claim_booking(bigint) from public;
grant execute on function public.create_booking(text, text, text, text, text, numeric, numeric, text, timestamptz) to authenticated;
grant execute on function public.claim_booking(bigint) to authenticated;
