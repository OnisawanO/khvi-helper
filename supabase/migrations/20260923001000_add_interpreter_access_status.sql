-- Separate a reversible role change from a real interpreter accreditation revocation.
alter table public.profiles
  add column if not exists interpreter_access_status text not null default 'active';

alter table public.profiles
  drop constraint if exists profiles_interpreter_access_status_check;

alter table public.profiles
  add constraint profiles_interpreter_access_status_check
  check (interpreter_access_status in ('active', 'revoked'));

create index if not exists profiles_interpreter_access_status_idx
  on public.profiles(interpreter_access_status);

-- This field is managed only by the trusted account-security Edge Function.
