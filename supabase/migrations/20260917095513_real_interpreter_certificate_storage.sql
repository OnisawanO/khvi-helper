-- Private certificate storage for interpreter applications.
-- Object paths must start with the authenticated user's id.

insert into storage.buckets (id, name, public)
values ('interpreter-certificates', 'interpreter-certificates', false)
on conflict (id) do update set public = false;

drop policy if exists interpreter_certificates_insert_own on storage.objects;
create policy interpreter_certificates_insert_own
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'interpreter-certificates'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists interpreter_certificates_select_own_or_staff on storage.objects;
create policy interpreter_certificates_select_own_or_staff
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'interpreter-certificates'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1
        from public.profiles p
        where p.user_id = (select auth.uid())
          and p.role in ('Manager', 'Admin')
      )
    )
  );

drop policy if exists interpreter_certificates_update_own on storage.objects;
create policy interpreter_certificates_update_own
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'interpreter-certificates'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'interpreter-certificates'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
