-- Database-backed interpreter applications and manager review flow.
-- The existing application tables remain the source of truth; this migration
-- moves writes behind authenticated RPCs and keeps direct table writes closed.

create index if not exists interpreter_applications_user_status_idx
  on public.interpreter_applications(user_id, status);

revoke insert, update, delete on table public.interpreter_applications from authenticated;
revoke insert, update, delete on table public.interpreter_application_languages from authenticated;
revoke insert, update, delete on table public.interpreter_application_categories from authenticated;

create or replace function public.submit_interpreter_application(
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_email text,
  p_extra_contact text,
  p_assigned_area text,
  p_language_codes text[],
  p_category_codes text[],
  p_certificate_file_name text,
  p_certificate_url text default null
)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := (select auth.uid());
  application_id_value bigint;
  existing_status text;
  calculated_age smallint;
begin
  if current_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if trim(coalesce(p_first_name, '')) = '' or trim(coalesce(p_last_name, '')) = '' then
    raise exception 'applicant_name_required';
  end if;
  if trim(coalesce(p_phone, '')) = '' then
    raise exception 'applicant_phone_required';
  end if;
  if coalesce(array_length(p_language_codes, 1), 0) = 0 then
    raise exception 'application_language_required';
  end if;
  if coalesce(array_length(p_category_codes, 1), 0) = 0 then
    raise exception 'application_category_required';
  end if;
  if trim(coalesce(p_certificate_file_name, '')) = '' then
    raise exception 'application_certificate_required';
  end if;
  if nullif(trim(coalesce(p_certificate_url, '')), '') is not null
     and left(trim(p_certificate_url), length(current_user_id::text) + 1) <> (current_user_id::text || '/') then
    raise exception 'invalid_certificate_path';
  end if;

  if exists (
    select 1
    from unnest(p_language_codes) code
    left join public.languages l on l.language_code = code and l.is_active = true
    where l.language_id is null
  ) then
    raise exception 'unsupported_language';
  end if;

  if exists (
    select 1
    from unnest(p_category_codes) code
    left join public.categories c on c.category_code = code and c.is_active = true
    where c.category_id is null
  ) then
    raise exception 'unsupported_category';
  end if;

  select case
    when p.date_of_birth is null then null
    else extract(year from age(current_date, p.date_of_birth))::smallint
  end
  into calculated_age
  from public.profiles p
  where p.user_id = current_user_id;

  select ia.application_id, ia.status
  into application_id_value, existing_status
  from public.interpreter_applications ia
  where ia.user_id = current_user_id
    and ia.status <> 'cancelled'
  order by ia.application_id desc
  limit 1
  for update;

  if existing_status = 'approved' then
    raise exception 'approved_application_exists';
  end if;

  update public.profiles
  set first_name = trim(p_first_name),
      last_name = trim(p_last_name),
      phone = trim(p_phone)
  where user_id = current_user_id;

  if application_id_value is null then
    insert into public.interpreter_applications (
      user_id, applicant_name, phone, email, age, extra_contact, assigned_area,
      certificate_file_name, certificate_url, status, submitted_at
    )
    values (
      current_user_id,
      trim(concat(p_first_name, ' ', p_last_name)),
      trim(p_phone),
      coalesce(nullif(trim(p_email), ''), (select email from auth.users where id = current_user_id), ''),
      calculated_age,
      nullif(trim(coalesce(p_extra_contact, '')), ''),
      nullif(trim(coalesce(p_assigned_area, '')), ''),
      trim(p_certificate_file_name),
      nullif(trim(coalesce(p_certificate_url, '')), ''),
      'pending',
      timezone('utc', now())
    )
    returning public.interpreter_applications.application_id into application_id_value;
  else
    update public.interpreter_applications
    set applicant_name = trim(concat(p_first_name, ' ', p_last_name)),
        phone = trim(p_phone),
        email = coalesce(nullif(trim(p_email), ''), (select email from auth.users where id = current_user_id), ''),
        age = calculated_age,
        extra_contact = nullif(trim(coalesce(p_extra_contact, '')), ''),
        assigned_area = nullif(trim(coalesce(p_assigned_area, '')), ''),
        certificate_file_name = trim(p_certificate_file_name),
        certificate_url = nullif(trim(coalesce(p_certificate_url, '')), ''),
        status = 'pending',
        reject_reason = null,
        revision_note = null,
        cancellation_reason = null,
        cancelled_at = null,
        cancelled_by_user_id = null,
        reviewed_at = null,
        reviewed_by_user_id = null,
        submitted_at = timezone('utc', now())
    where public.interpreter_applications.application_id = application_id_value;
  end if;

  delete from public.interpreter_application_languages
  where interpreter_application_languages.application_id = application_id_value;
  insert into public.interpreter_application_languages (application_id, language_id, is_primary)
  select application_id_value, l.language_id, row_number() over (order by l.language_id) = 1
  from public.languages l
  where l.language_code = any(p_language_codes)
    and l.is_active = true;

  delete from public.interpreter_application_categories
  where interpreter_application_categories.application_id = application_id_value;
  insert into public.interpreter_application_categories (application_id, category_id)
  select application_id_value, c.category_id
  from public.categories c
  where c.category_code = any(p_category_codes)
    and c.is_active = true;

  return application_id_value;
end;
$$;

create or replace function public.cancel_interpreter_application(
  p_application_id bigint,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  update public.interpreter_applications
  set status = 'cancelled',
      cancellation_reason = nullif(trim(coalesce(p_reason, '')), ''),
      cancelled_at = timezone('utc', now()),
      cancelled_by_user_id = (select auth.uid())
  where application_id = p_application_id
    and user_id = (select auth.uid())
    and status in ('pending', 'under_review', 'needs_revision');

  if not found then
    raise exception 'application_cancel_not_allowed';
  end if;
end;
$$;

create or replace function public.reupload_interpreter_certificate(
  p_application_id bigint,
  p_certificate_file_name text,
  p_certificate_url text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if trim(coalesce(p_certificate_file_name, '')) = '' then
    raise exception 'application_certificate_required';
  end if;
  if nullif(trim(coalesce(p_certificate_url, '')), '') is not null
     and left(trim(p_certificate_url), length((select auth.uid())::text) + 1) <> ((select auth.uid())::text || '/') then
    raise exception 'invalid_certificate_path';
  end if;

  update public.interpreter_applications
  set certificate_file_name = trim(p_certificate_file_name),
      certificate_url = nullif(trim(coalesce(p_certificate_url, '')), ''),
      status = 'under_review',
      reject_reason = null,
      revision_note = null,
      reviewed_at = null,
      reviewed_by_user_id = null
  where application_id = p_application_id
    and user_id = (select auth.uid())
    and status in ('needs_revision', 'rejected');

  if not found then
    raise exception 'application_reupload_not_allowed';
  end if;
end;
$$;

create or replace function public.review_interpreter_application(
  p_application_id bigint,
  p_decision text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := (select auth.uid());
  actor_role text;
  target_user_id uuid;
  target_status text;
begin
  if current_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select role into actor_role from public.profiles where user_id = current_user_id;
  if actor_role not in ('Manager', 'Admin') then
    raise exception 'manager_role_required' using errcode = '42501';
  end if;
  if p_decision not in ('approved', 'needs_revision', 'rejected') then
    raise exception 'invalid_review_decision';
  end if;
  if p_decision in ('needs_revision', 'rejected') and trim(coalesce(p_note, '')) = '' then
    raise exception 'review_note_required';
  end if;

  select user_id, status into target_user_id, target_status
  from public.interpreter_applications
  where application_id = p_application_id
  for update;

  if target_user_id is null then
    raise exception 'application_not_found';
  end if;
  if target_status = 'cancelled' then
    raise exception 'cancelled_application_not_reviewable';
  end if;
  if target_status = 'approved' and p_decision <> 'approved' and actor_role <> 'Admin' then
    raise exception 'approved_application_requires_admin';
  end if;

  update public.interpreter_applications
  set status = p_decision,
      reject_reason = case when p_decision = 'rejected' then trim(p_note) else null end,
      revision_note = case when p_decision = 'needs_revision' then trim(p_note) else null end,
      reviewed_at = timezone('utc', now()),
      reviewed_by_user_id = current_user_id
  where application_id = p_application_id;

  if p_decision = 'approved' then
    update public.profiles
    set role = 'Interpreter', is_locked = false, lock_reason = null
    where user_id = target_user_id;
  end if;
end;
$$;

revoke all on function public.submit_interpreter_application(text, text, text, text, text, text, text[], text[], text, text) from public;
revoke all on function public.cancel_interpreter_application(bigint, text) from public;
revoke all on function public.reupload_interpreter_certificate(bigint, text, text) from public;
revoke all on function public.review_interpreter_application(bigint, text, text) from public;

grant execute on function public.submit_interpreter_application(text, text, text, text, text, text, text[], text[], text, text) to authenticated;
grant execute on function public.cancel_interpreter_application(bigint, text) to authenticated;
grant execute on function public.reupload_interpreter_certificate(bigint, text, text) to authenticated;
grant execute on function public.review_interpreter_application(bigint, text, text) to authenticated;
