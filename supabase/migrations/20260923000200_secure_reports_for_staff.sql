-- Reports are currently managed by the Manager/Admin backoffice.
-- End-user report submission policies can be added when those flows are implemented.

create or replace function private.is_report_staff()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = (select auth.uid())
      and role in ('Manager', 'Admin')
      and is_locked = false
  );
$$;

revoke all on function private.is_report_staff() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_report_staff() to authenticated;

alter table public.reports enable row level security;

revoke all on table public.reports from anon, authenticated;
grant select, update on table public.reports to authenticated;

drop policy if exists reports_select_staff on public.reports;
create policy reports_select_staff
  on public.reports
  for select
  to authenticated
  using ((select private.is_report_staff()));

drop policy if exists reports_update_staff on public.reports;
create policy reports_update_staff
  on public.reports
  for update
  to authenticated
  using ((select private.is_report_staff()))
  with check ((select private.is_report_staff()));

-- Manager/Admin report loading resolves reporter, target and assignee names
-- from profiles. Keep the existing self-read rule and allow staff lookups.
drop policy if exists profiles_select_staff on public.profiles;
create policy profiles_select_staff
  on public.profiles
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select private.is_report_staff())
  );
