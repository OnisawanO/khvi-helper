-- Track the Manager-to-Admin handoff separately from the report's current
-- status so Admin can keep post-escalation history without seeing reports
-- that Manager resolved before escalation.
alter table public.reports
  add column if not exists escalated_at timestamptz,
  add column if not exists escalated_by uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reports_escalated_by_fk'
      and conrelid = 'public.reports'::regclass
  ) then
    alter table public.reports
      add constraint reports_escalated_by_fk
      foreign key (escalated_by)
      references public.profiles(user_id)
      on delete set null;
  end if;
end;
$$;

update public.reports
set escalated_at = coalesce(updated_at, created_at)
where status = 'escalated'
  and escalated_at is null;

create index if not exists reports_escalated_at_idx
  on public.reports(escalated_at)
  where escalated_at is not null;
