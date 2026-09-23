-- Allow active Manager accounts to read the shared operations history.
-- Admin access remains available through the same policy.
drop policy if exists system_audit_logs_select_admin on public.system_audit_logs;

create policy system_audit_logs_select_staff
  on public.system_audit_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.user_id = (select auth.uid())
        and p.role in ('Manager', 'Admin')
        and not p.is_locked
    )
  );
