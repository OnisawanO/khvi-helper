begin;

-- Reports are system-only. The preceding migration enforces that constraint,
-- so report_type is now redundant and can be removed from the data model.
alter table public.reports
  drop constraint if exists reports_system_only_check;

drop index if exists public.reports_type_idx;

alter table public.reports
  drop column if exists report_type;

commit;
