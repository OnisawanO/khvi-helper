begin;

-- Remove the legacy insert policy before dropping the column it references.
-- System reports are currently managed by Manager/Admin only.
drop policy if exists reports_insert_authenticated on public.reports;

-- Verify the existing table is already system-only before removing the legacy target column.
-- The migration must fail instead of silently discarding person-report data.
do $$
declare
  has_reported_user_id boolean;
  has_legacy_reports boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'reports'
      and column_name = 'reported_user_id'
  )
  into has_reported_user_id;

  if has_reported_user_id then
    execute $query$
      select exists (
        select 1
        from public.reports
        where report_type <> 'system'
           or reported_user_id is not null
      )
    $query$
    into has_legacy_reports;

    if has_legacy_reports then
      raise exception 'Cannot convert reports to system-only: legacy person reports or targets still exist';
    end if;
  end if;
end $$;

alter table public.reports
  drop constraint if exists reports_type_target_check;

alter table public.reports
  drop constraint if exists reports_reporter_target_check;

alter table public.reports
  drop constraint if exists reports_reported_user_fk;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.reports'::regclass
      and conname = 'reports_system_only_check'
  ) then
    alter table public.reports
      add constraint reports_system_only_check
      check (report_type = 'system');
  end if;
end $$;

alter table public.reports
  alter column report_type set default 'system';

drop index if exists public.reports_reported_user_id_idx;

alter table public.reports
  drop column if exists reported_user_id;

commit;
