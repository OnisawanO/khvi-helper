-- Allow approved interpreters to submit profile/skill updates for manager re-approval
-- and add is_profile_update column to distinguish profile updates from new volunteer applications

alter table public.interpreter_applications
  add column if not exists is_profile_update boolean not null default false;

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

  update public.profiles
  set first_name = trim(p_first_name),
      last_name = trim(p_last_name),
      phone = trim(p_phone)
  where user_id = current_user_id;

  if application_id_value is null then
    insert into public.interpreter_applications (
      user_id, applicant_name, phone, email, age, extra_contact, assigned_area,
      certificate_file_name, certificate_url, status, submitted_at, is_profile_update
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
      timezone('utc', now()),
      false
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
        is_profile_update = true,
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

