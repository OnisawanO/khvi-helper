-- Keep account restriction state explicit so the dashboard can distinguish
-- a reversible suspension from a permanent enforcement decision.
alter table public.profiles
  add column if not exists restriction_type text not null default 'none',
  add column if not exists restriction_reason text,
  add column if not exists restriction_at timestamptz,
  add column if not exists restriction_by_user_id uuid references public.profiles(user_id) on delete set null;

update public.profiles
set
  restriction_type = case
    when lock_reason like '[PERMANENT BAN]%' then 'hard'
    when is_locked then 'soft'
    else 'none'
  end,
  restriction_reason = case
    when lock_reason like '[PERMANENT BAN]%'
      then nullif(regexp_replace(lock_reason, '^\[PERMANENT BAN\]\s*', ''), '')
    else nullif(trim(lock_reason), '')
  end,
  restriction_at = case
    when is_locked then coalesce(updated_at, created_at)
    else null
  end
where restriction_type = 'none';

alter table public.profiles
  drop constraint if exists profiles_restriction_type_check;

alter table public.profiles
  add constraint profiles_restriction_type_check
  check (restriction_type in ('none', 'soft', 'hard'));

alter table public.profiles
  drop constraint if exists profiles_restriction_consistency_check;

alter table public.profiles
  add constraint profiles_restriction_consistency_check
  check (
    (restriction_type = 'none' and is_locked = false)
    or (restriction_type in ('soft', 'hard') and is_locked = true)
  );

create index if not exists profiles_restriction_type_idx
  on public.profiles(restriction_type);

-- The browser must not write these enforcement fields directly. The trusted
-- manage-account-security Edge Function uses the service role to update them.
