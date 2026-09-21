-- Keep the application UI language catalog aligned with the supported locales.
-- Existing Burmese/Vietnamese preferences are preserved by mapping them to English.

update public.profiles
set preferred_ui_language = 'en'
where preferred_ui_language in ('my', 'vi');

alter table public.profiles
  drop constraint if exists profiles_preferred_ui_language_check;

alter table public.profiles
  add constraint profiles_preferred_ui_language_check
  check (preferred_ui_language in ('th', 'en', 'zh', 'es', 'ar'));

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  full_name text := trim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  first_name_value text := nullif(
    trim(coalesce(nullif(new.raw_user_meta_data ->> 'first_name', ''), split_part(full_name, ' ', 1))),
    ''
  );
  last_name_value text := nullif(
    trim(coalesce(
      nullif(new.raw_user_meta_data ->> 'last_name', ''),
      btrim(substr(full_name, length(split_part(full_name, ' ', 1)) + 1))
    )),
    ''
  );
  date_of_birth_value date;
begin
  if coalesce(new.raw_user_meta_data ->> 'date_of_birth', '') ~ '^\d{4}-\d{2}-\d{2}$' then
    date_of_birth_value := (new.raw_user_meta_data ->> 'date_of_birth')::date;
  end if;

  insert into public.profiles (
    user_id,
    first_name,
    last_name,
    phone,
    date_of_birth,
    preferred_ui_language,
    role
  )
  values (
    new.id,
    coalesce(first_name_value, 'KHVI User'),
    coalesce(last_name_value, ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    date_of_birth_value,
    case
      when new.raw_user_meta_data ->> 'preferred_ui_language' in ('th', 'en', 'zh', 'es', 'ar')
        then new.raw_user_meta_data ->> 'preferred_ui_language'
      else 'th'
    end,
    'User'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;
