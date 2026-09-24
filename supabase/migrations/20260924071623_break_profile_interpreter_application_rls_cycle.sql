-- Keep profiles policies from recursively re-entering through
-- interpreter_applications. The previous application policies queried
-- public.profiles directly, while profiles_update_admin also queries
-- interpreter_applications to validate Interpreter promotions.

create or replace function private.is_interpreter_application_staff()
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
  );
$$;

revoke all on function private.is_interpreter_application_staff() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_interpreter_application_staff() to authenticated;

drop policy if exists interpreter_applications_select_own_or_staff
  on public.interpreter_applications;
create policy interpreter_applications_select_own_or_staff
  on public.interpreter_applications
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select private.is_interpreter_application_staff())
  );

drop policy if exists interpreter_applications_update_own_or_staff
  on public.interpreter_applications;
create policy interpreter_applications_update_own_or_staff
  on public.interpreter_applications
  for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select private.is_interpreter_application_staff())
  )
  with check (
    (select auth.uid()) = user_id
    or (select private.is_interpreter_application_staff())
  );
